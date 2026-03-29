import axios from "axios"

export const askAI = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || !messages.length) {
            throw new Error("Error is Message Array");
        }
        const aiRes = await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-4o-mini',
                    messages: messages
                }),
            },

        )
        const content = aiRes?.data?.choices?.[0]?.messages?.content ;
        if(!content || !content.trim()) throw new Error("AI returned empty response");
        return content ;

    } catch (error) {
        console.log(error);
    }
};