import OpenAI from "openai";
import AbstractAIService from "./AbstractAIService";
import nConsole from "../../logger/NikoragLogger";

const apiKey: string | undefined = process.env.OPENAI_API_KEY;
const model: string = process.env.OPENAI_MODEL || "gpt-4o";

class OpenAIService extends AbstractAIService {
    openai: OpenAI;

    constructor() {
        super();
        this.openai = new OpenAI({ apiKey });
    }

    async askQuestion(content: string): Promise<string> {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                model,
                messages: [{ role: "user", content }],
            });

            const response = chatCompletion.choices[0]?.message?.content;
            if (!response) throw new Error("OpenAI returned an empty response.");

            return response;
        } catch (error) {
            nConsole.error("Error asking question to OpenAI:", error);
            throw error;
        }
    }
}

export default new OpenAIService();