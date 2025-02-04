import { GenerationConfig, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import AbstractAIService from "./AbstractAIService";
import nConsole from "../../logger/NikoragLogger";

const GEMINI_API_KEY : string | undefined = process.env.GEMINI_API_KEY;
const model : string = process.env.GEMINI_MODEL || "gemini-1.5-flash"

class GeminiService extends AbstractAIService {
    genAI : GoogleGenerativeAI;
    model : GenerativeModel;
    generationConfig : GenerationConfig;

    constructor() {
        super();
        if (GEMINI_API_KEY && GEMINI_API_KEY !== ""){
            this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

            this.model = this.genAI.getGenerativeModel({
                model
            });

            this.generationConfig = {
                temperature: 2,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain"
            };
        } else {
            throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
        }
    }

    async askQuestion(prompt: string): Promise<string> {
        try {
            const chatSession = this.model.startChat({generationConfig : this.generationConfig});
            const result = await chatSession.sendMessage(prompt);

            return result.response.text();
        } catch (error) {
            nConsole.error("Error asking question to Gemini:", error);
            throw error;
        }
    }
}

export default new GeminiService();