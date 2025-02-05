import { promptStem } from "../builder/PromptBuilder";
import nConsole from "../logger/NikoragLogger";
import AISensorResult from "../model/AISensorResult";
import HomeAssistantReading from "../model/HomeAssistantReading";
import { getAIService } from "./ai/AIServiceFactory";
import configService, { Config } from "./ConfigService";
import { getEntityReadings } from "./HomeAssistantService";
import MQTTService from "./MQTTService";
import cron, { ScheduledTask } from 'node-cron';

let mqttService : MQTTService;
let scheduledTask : ScheduledTask;

const aiHomeService = {
    init : async (propertyMap : Config) => {
        //Stop any existing scheduled task
        if (scheduledTask){
            scheduledTask.stop();
        }
        const cronSchedule : string = await configService.get('CRON_SCHEDULE', "*/15 * * * *") as string;
        mqttService = new MQTTService(async (service : MQTTService) => {
            processReadings(service);
            scheduledTask = cron.schedule(cronSchedule, () => {
                processReadings(service);
            });
        }, propertyMap);
    }
}

export default aiHomeService;

async function processReadings(service : MQTTService){
    try {
        const propertyMap : Config = await configService.getPropertyMap();

        const sensorIds : string[] = propertyMap.SENSOR_IDS.split(",");
        const interval : number = parseInt(propertyMap.INTERVAL || "15");

        nConsole.info("Getting Readings from Home Assistant");
        const allReadings : HomeAssistantReading[][] = await Promise.all(sensorIds.map(async (sensorId) => {
            return await getEntityReadings(sensorId, interval, propertyMap);
        }));

        let readings : HomeAssistantReading[] = allReadings.flat();

        nConsole.info(`Got ${readings.length} Readings from Home Assistant`);

        if (readings.length > 1){
            nConsole.info("Asking AI");
            const prompt = `${promptStem} ${JSON.stringify(readings, null, 2)}`;
            let responseText = 
                (await (await getAIService(propertyMap)).askQuestion(prompt))
                .trim()
                .replace(/^```json/, "")
                .replace(/```$/, "");

            const responseJson : AISensorResult[] = JSON.parse(responseText);    

            nConsole.info(`AI Response: ${JSON.stringify(responseJson)}`);
            service.publishSensorReadings(responseJson[0]);
        }
    } catch (error) {
        nConsole.error("Error processing readings:", error);
    }
}