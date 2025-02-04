abstract class AbstractAIService {
    abstract askQuestion(prompt : string) : Promise<string>;
}

export default AbstractAIService;