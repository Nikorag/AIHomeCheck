import mqtt, { IClientOptions, MqttClient } from "mqtt";
import { MQTTDevice, MQTTDiscoveryMessage } from "../model/MQTTModels";
import AISensorResult from "../model/AISensorResult";
import nConsole from "../logger/NikoragLogger";

const { MQTT_BROKER_URL, MQTT_USERNAME, MQTT_PASSWORD, MQTT_DEVICE_NAME } = process.env as { MQTT_BROKER_URL: string, MQTT_USERNAME: string, MQTT_PASSWORD: string, MQTT_DEVICE_NAME: string };

export type MQTTConnectionCallback = (service : MQTTService) => void;

export default class MQTTService {
    client : MqttClient;
    binarySensorTopicBase : string;
    textSensorTopicBase : string;

    constructor(connectionCallback : MQTTConnectionCallback){
        this.binarySensorTopicBase = `homeassistant/binary_sensor/${MQTT_DEVICE_NAME}/status`;
        this.textSensorTopicBase = `homeassistant/sensor/${MQTT_DEVICE_NAME}/message`;
        
        const clientId : string = `${MQTT_DEVICE_NAME}_${Math.random().toString(16).slice(2)}`;
        
        const connectionOptions : IClientOptions = { clientId };
        if (MQTT_PASSWORD) {
            connectionOptions.username = MQTT_USERNAME;
            connectionOptions.password = MQTT_PASSWORD;
        }
        
        this.client = mqtt.connect(MQTT_BROKER_URL, connectionOptions);

        this.client.on('connect', () => {
            nConsole.info('Connected to MQTT broker');
            this.publishDiscovery();

            connectionCallback(this);
        });

        this.client.on('error', (err : any) => {
            nConsole.error('MQTT error:', err);
        });
    }

    publishDiscovery(){
        const device : MQTTDevice = {
            identifiers: [MQTT_DEVICE_NAME],
            name: MQTT_DEVICE_NAME,
            manufacturer: "Nikorag",
            model: "AIHomeCheck"
        }

        // Binary Sensor Discovery
        const binarySensorDiscoveryMessage : MQTTDiscoveryMessage = {
            name: `Status`,
            state_topic: `${this.binarySensorTopicBase}/state`,
            value_template: '{{ value_json.status }}',
            unique_id: `${MQTT_DEVICE_NAME}_status`,
            device
        };
        this.client.publish(`${this.binarySensorTopicBase}/config`, JSON.stringify(binarySensorDiscoveryMessage), {
            retain: true,
        });

        // Text Sensor Discovery
        const textSensorDiscoveryMessage = {
            name: `Message`,
            state_topic: `${this.textSensorTopicBase}/state`,
            value_template: '{{ value_json.message }}',
            unique_id: `${MQTT_DEVICE_NAME}_message`,
            device
        };
        this.client.publish(`${this.textSensorTopicBase}/config`, JSON.stringify(textSensorDiscoveryMessage), {
            retain: true,
        });
    }

    publishSensorReadings({status, message} : AISensorResult){
        this.client.publish(`${this.binarySensorTopicBase}/state`, JSON.stringify({ status : status ? 'ON' : 'OFF' }));
        nConsole.log( JSON.stringify({ message }, null, 2));
        this.client.publish(`${this.textSensorTopicBase}/state`, JSON.stringify({message}));
    }
}