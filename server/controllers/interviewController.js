import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from "../services/openRouterService.js";
import User from "../models/userModel.js";
import Interview from "../models/interviewModel.js";

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Resume is not available" });

        const filePath = req.file.path;
        const binaryFile = await fs.promises.readFile(filePath);
        const uint8Array = new Uint8Array(binaryFile);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        // Extract all pages from PDF
        for (let page = 1; page <= pdf.numPages; page++) {
            const p = await pdf.getPage(page);
            const content = await p.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        // Clean the text
        resumeText = resumeText.replace(/\s+/g, " ").trim();

        const messages = [
            {
                role: "system",
                content: `
                Extract structured data from the resume.
                Return ONLY raw JSON with no markdown, no backticks, no extra text:
                {
                    "role": "string",
                    "experience": "string",
                    "projects": ["Project1", "Project2"],
                    "skills": ["skill1", "skill2"]
                }
                `
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiRes = await askAI(messages);
        console.log(aiRes);

        // Strip markdown fences if present
        const cleanedRes = aiRes.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
        const parsedRes = JSON.parse(cleanedRes);

        fs.unlinkSync(filePath); // delete the file

        res.json({
            role: parsedRes.role,
            experience: parsedRes.experience,
            projects: parsedRes.projects,
            skills: parsedRes.skills,
            resumeText
        });

    } catch (error) {
        console.log(error);

        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(500).json({ message: error.message });
    }
};

export const generateQuestions = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body;
        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json({ message: "Role, Experience and mode is required" });
        }

        const user = await User.findById(req.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.credits < 50) return res.status(200).json("Minimum 50 credits needed");

        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
        const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
            Role: ${role},
            Experience: ${experience},
            InterviewMode: ${mode},
            projects: ${projectText},
            skills: ${skillsText},
            resume: ${safeResume}
        `;

        if (!userPrompt.trim()) return res.status(400).json({ message: "Promp content is empty" });

        const messages = [

            {
                role: "system",
                content: `
                    You are a real human interviewer conducting a professional interview.

                    Speak in simple, natural English as if you are directly talking to the candidate.

                    Generate exactly 5 interview questions.

                    Strict Rules:
                    - Each question must contain between 15 and 25 words.
                    - Each question must be a single complete sentence.
                    - Do NOT number them.
                    - Do NOT add explanations.
                    - Do NOT add extra text before or after.
                    - One question per line only.
                    - Keep language simple and conversational.
                    - Questions must feel practical and realistic.

                    Difficulty progression:
                    Question 1 → easy  
                    Question 2 → easy  
                    Question 3 → medium  
                    Question 4 → medium  
                    Question 5 → hard  

                    Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
                    `
            }
            ,
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiRes = await askAI(messages);

        if (!aiRes || !aiRes.trim()) return res.status(500).json({ message: "AI returned empty response" });

        const questionArray = aiRes
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5);

        if (questionArray.length == 0) return res.status(500).json({ message: "AI returned empty response" });

        user.credits -= 50;
        await user.save();

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                timeLimit: [60, 60, 90, 90, 120][index]
            }))
        })

        res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions
        });




    } catch (error) {
        return res.status(500).json({ message: error.message });
    };


};

export const submitAnswer = async (req, res) => {
  try {
    let { interviewId, questionIndex, answer, timeTaken } = req.body;

    questionIndex = Number(questionIndex);
    timeTaken = Number(timeTaken || 0);
    answer = answer?.trim() || "";

    const interviewDoc = await Interview.findById(interviewId);

    if (!interviewDoc) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const question = interviewDoc.questions[questionIndex];

    if (!question) {
      return res.status(400).json({ message: "Invalid question index" });
    }

    if (!answer) {
      question.answer = "";
      question.score = 0;
      question.feedback = "You did not submit an answer";

      await interviewDoc.save();
      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.answer = answer;
      question.score = 0;
      question.feedback = "Time limit exceeded.";

      await interviewDoc.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer.

Score from 0-10 in:
1. Confidence
2. Communication
3. Correctness

finalScore = average of the three (rounded).

Feedback:
- 10 to 15 words
- Professional, honest
- Suggest improvement if needed

Return ONLY JSON:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
        `,
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
        `,
      },
    ];

    const aiRes = await askAI(messages);

    let parsedRes;
    try {
      parsedRes = JSON.parse(aiRes);
    } catch {
      // fallback if AI returns extra text
      const jsonMatch = aiRes.match(/\{[\s\S]*\}/);
      parsedRes = JSON.parse(jsonMatch[0]);
    }

    const {
      confidence,
      communication,
      correctness,
      finalScore,
      feedback,
    } = parsedRes;

    // ---- save result ----
    question.answer = answer;
    question.confidence = confidence;
    question.communication = communication;
    question.correctness = correctness;
    question.score = finalScore;
    question.feedback = feedback;

    await interviewDoc.save();

    return res.status(200).json({ feedback });

  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to submit answer: ${error.message}` });
  }
};


export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Failed to find interview" });
    }

    const totalQuestions = interview.questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({ message: "No questions found in interview" });
    }

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgScore = totalScore / totalQuestions;
    const avgConfidence = totalConfidence / totalQuestions;
    const avgCommunication = totalCommunication / totalQuestions;
    const avgCorrectness = totalCorrectness / totalQuestions;

    interview.finalScore = Number(avgScore.toFixed(1));
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionwiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to finish interview: ${error.message}`,
    });
  }
};
