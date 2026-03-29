import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs" ;
import { askAI } from "../services/openRouterService.js";


export const analyzeResume = (async (req, res)=>{
    try{
        if(!req.file) return res.status(400).json({message:"Resume is not available"});
        const filePath = req.file.path ;
        const binaryFile = await fs.promises.readFile(filePath); // binary data
        const uint8Array = new Uint8Array(binaryFile);
        const pdf = await pdfjsLib.getDocument({data: uint8Array}).promise;

        let resumeText = "" ;

        //extract all pages from pdf 

        for(let page = 1 ; page <= pdf.numPages ; page++){
            const p = await pdf.getPage(page);
            const content = await p.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";

        }

        // cleaning the text
        resumeText = resumeText.replace(/\s+/g, " ").trim()

        const messages = [
            {
                role:"system",
                content: `
                Extract structured file data from resume.
                Return strictly JSON:
                {
                    "role": "string",
                    "experience": "string"
                    "project": ["Project1", "Project2"],
                    "skills" : ["skill1", "skill2"]
                }
                `
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiRes = await askAI(messages);
        const parsedRes = JSON.parse(aiRes);

        fs.unlinkSync(filePath); // delete the file

        res.json({
            role: parsedRes.role,
            experience: parsedRes.experience,
            projects: parsedRes.projects,
            skills: parsedRes.skills,
            resumeText
        });

    }catch(error){
        console.log(error);
        
        if(req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(500).json({message: error.message});
    }
})