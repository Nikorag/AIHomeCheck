import { Config } from '../ConfigService';
import AbstractAIService from './AbstractAIService';

export const getAIService = async (propertyMap : Config) : Promise<AbstractAIService> => {

    switch (propertyMap.AI_SERVICE) {
        case 'gemini': 
            return new (await import('./GeminiService')).default(propertyMap);
        case 'openai':
        default:
            return new (await import('./OpenAiService')).default(propertyMap);    
    }
}