import axios from "axios";

export const askAI = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || !messages.length) {
      throw new Error("Error in Message Array");
    }

    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = aiRes?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) throw new Error("AI returned empty response");
    return content;

  } catch (error) {
    console.log(error);
  }
};