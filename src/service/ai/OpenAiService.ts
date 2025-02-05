import OpenAI from "openai";
import AbstractAIService from "./AbstractAIService";
import nConsole from "../../logger/NikoragLogger";
import { Config } from "../ConfigService";

class OpenAIService extends AbstractAIService {
    openai: OpenAI;
    apiKey: string;
    model: string;

    constructor(proertyMap: Config) {
        super();
        this.apiKey = proertyMap.OPENAI_API_KEY;
        this.model = proertyMap.OPENAI_MODEL || "gpt-4o";

        this.openai = new OpenAI({ apiKey : this.apiKey });
    }

    async askQuestion(content: string): Promise<string> {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                model : this.model,
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

export default OpenAIService;