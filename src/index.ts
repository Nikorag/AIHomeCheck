import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import MQTTService from './service/MQTTService';
import {getEntityReadings} from './service/HomeAssistantService';
import HomeAssistantReading from './model/HomeAssistantReading';
import { getAIService } from './service/ai/AIServiceFactory';
import { promptStem } from './builder/PromptBuilder';
import AISensorResult from './model/AISensorResult';
import nConsole from './logger/NikoragLogger';


const SENSOR_IDS = process.env.SENSOR_IDS || "";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "*/15 * * * *";
const INTERVAL = parseInt(process.env.INTERVAL || "15");

const mqttService = new MQTTService(async (service : MQTTService) => {
    processReadings(service);
    const scheduledJob = cron.schedule(CRON_SCHEDULE, () => {
        processReadings(service);
    });
});

async function processReadings(service : MQTTService){
    try {
        const sensorIds : string[] = SENSOR_IDS.split(",");

        nConsole.info("Getting Readings from Home Assistant");
        const allReadings : HomeAssistantReading[][] = await Promise.all(sensorIds.map(async (sensorId) => {
            return await getEntityReadings(sensorId, INTERVAL);
        }));

        let readings : HomeAssistantReading[] = allReadings.flat();

        nConsole.info(`Got ${readings.length} Readings from Home Assistant`);

        if (readings.length > 1){
            nConsole.info("Asking AI");
            const prompt = `${promptStem} ${JSON.stringify(readings, null, 2)}`;
            let responseText = 
                (await (await getAIService()).askQuestion(prompt))
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