import { GenerationConfig, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import AbstractAIService from "./AbstractAIService";
import nConsole from "../../logger/NikoragLogger";
import { Config } from "../ConfigService";

class GeminiService extends AbstractAIService {
    genAI : GoogleGenerativeAI;
    model : GenerativeModel;
    generationConfig : GenerationConfig;
    geminiApiKey : string;

    constructor(propertyMap : Config) {
        super();
        this.geminiApiKey = propertyMap.GEMINI_API_KEY;
        const modelName : string = propertyMap.GEMINI_MODEL || "gemini-1.5-flash";
        if (this.geminiApiKey && this.geminiApiKey !== ""){
            this.genAI = new GoogleGenerativeAI(this.geminiApiKey);

            this.model = this.genAI.getGenerativeModel({
                model : modelName
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

export default GeminiService;