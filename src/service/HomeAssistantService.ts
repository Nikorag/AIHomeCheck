import axios, { AxiosResponse, AxiosError } from "axios";
import HomeAssistantReading from "../model/HomeAssistantReading";
import nConsole from "../logger/NikoragLogger";
import { Config } from "./ConfigService";
import { HomeAssistantEntity } from "../model/HomeAssistantEntity";

export const getEntityReadings = async (entityId: string, minutesOffset: number, {HOME_ASSISTANT_URL, ACCESS_TOKEN}: Config) : Promise<HomeAssistantReading[]> => {
    try {
        const endTime: Date =  new Date();
        const startTime: Date = new Date(endTime.getTime() - minutesOffset * 60 * 1000);
        const endTimeIso: string = endTime.toISOString();
        const startTimeIso: string = startTime.toISOString();

        const response: AxiosResponse<HomeAssistantReading[]> = await axios.get(
            `${HOME_ASSISTANT_URL}/api/history/period/${startTimeIso}`,
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    filter_entity_id: entityId,
                    end_time: endTimeIso
                },
            }
        );

        // Remove unavailable readings:
        const readings = response.data.flat().filter(({entity_id}) => entity_id === entityId).filter(({state}) => state != 'unavailable');
        return readings;
    } catch (error) {
        if (error instanceof AxiosError){
            nConsole.error('Error fetching sensor data:', error.response?.data || error.message);
        }
        throw error;
    }
}

export const getAllSensors = async ({HOME_ASSISTANT_URL, ACCESS_TOKEN}: Config) : Promise<HomeAssistantEntity[]> => {
    try {
        const response: AxiosResponse<HomeAssistantEntity[]> = await axios.get(
            `${HOME_ASSISTANT_URL}/api/states`,
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const sensors = response.data.filter(({entity_id}) => entity_id.startsWith("sensor."));
        return sensors;
    } catch (error) {
        if (error instanceof AxiosError){
            nConsole.error('Error fetching sensor data:', error.response?.data || error.message);
        }
        throw error;
    }
}