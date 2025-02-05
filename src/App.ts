import dotenv from 'dotenv';
dotenv.config();

import aiHomeService from './service/AiHomeCheckService';
import express, { Request, Response } from 'express';
import path from 'path';
import configService from './service/ConfigService';
import nConsole from './logger/NikoragLogger';
import { getAllSensors } from './service/HomeAssistantService';
import { testMQTT } from './service/MQTTService';
import { getAIService } from './service/ai/AIServiceFactory';

configService.init().then(async () => {
    const app = express();
    const port = 3000;

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../vue-config/dist')));

    app.get("/api/propertyMap", async (_, res : Response) => {
        nConsole.info("Getting Property Map for UI");
        const propertyMap = await configService.getPropertyMap();
        res.json(propertyMap || {});
    });

    app.post("/api/propertyMap", async (request: Request, res: Response) => {
        nConsole.info("Updating Property Map from UI");
        const newPropertyMap = request.body;
        
        for (let key of Object.keys(newPropertyMap)){
            await configService.set(key, newPropertyMap[key]);
        }

        configService.set('configComplete', "true")

        const updatedPropertyMap = await configService.getPropertyMap();
        aiHomeService.init(updatedPropertyMap);

        res.sendStatus(200);
    });

    app.post("/api/haTest", async (request: Request, res: Response) => {
        nConsole.info("Testing Home Assistant from UI");
        const newPropertyMap = request.body;

        try {
            const sensors = await getAllSensors(newPropertyMap);
            res.json({"result" : true, "sensors" : sensors});
        } catch (err : any){
            res.json({"result" : false, "sensors" : [], "message" : err?.message});
        }
    });

    app.post("/api/mqttTest", async (request: Request, res: Response) => {
        nConsole.info("Testing MQTT Broker from UI");
        const newPropertyMap = request.body;

        try {
            await testMQTT(newPropertyMap);
            res.json({"result" : true});
        } catch (err : any){
            res.json({"result" : false, "message" : err?.message});
        }
    });

    app.post("/api/aiTest", async (request: Request, res: Response) => {
        nConsole.info("Testing AI Service from UI");
        const newPropertyMap = request.body;

        try {
            const aiService = await getAIService(newPropertyMap);
            await aiService.askQuestion("Is this configured Correctly?");
            res.json({"result" : true});
        } catch (err : any){
            res.json({"result" : false, "message" : err?.message});
        }
    });

    app.listen(port, () => {
        nConsole.log(`Server is running on http://localhost:${port}`);
    });

    const propertyMap = await configService.getPropertyMap();

    const configComplete : boolean = propertyMap?.configComplete && propertyMap?.configComplete != "false";
    if (configComplete){
        aiHomeService.init(propertyMap);
    } else {
        nConsole.warn("Configuration is not complete. Please complete the configuration in the UI.");
    }
});