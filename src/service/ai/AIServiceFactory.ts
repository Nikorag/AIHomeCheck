import AbstractAIService from './AbstractAIService';

const { AI_SERVICE } = process.env as { AI_SERVICE : string };

export const getAIService = async () : Promise<AbstractAIService> => {
    switch (AI_SERVICE) {
        case 'gemini': 
            return (await import('./GeminiService')).default;
        case 'openai':
        default:
            return (await import('./OpenAiService')).default;    
    }
}