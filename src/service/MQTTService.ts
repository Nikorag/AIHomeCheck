import mqtt, { IClientOptions, MqttClient } from "mqtt";
import { MQTTDevice, MQTTDiscoveryMessage } from "../model/MQTTModels";
import AISensorResult from "../model/AISensorResult";
import nConsole from "../logger/NikoragLogger";
import { Config } from "./ConfigService";

export type MQTTConnectionCallback = (service : MQTTService) => void;

export const testMQTT = ({MQTT_BROKER_URL}: Config) : Promise<void> => {
    return new Promise((resolve, reject) => {
        const clientId : string = `${Math.random().toString(16).slice(2)}`;
        
        const connectionOptions : IClientOptions = { clientId };
        const testClient =  mqtt.connect(MQTT_BROKER_URL, connectionOptions);
        
        testClient.on('connect', () => {
            resolve();
        });

        testClient.on('error', (err : any) => {
           reject(err);
        });
    });
}

export default class MQTTService {
    client : MqttClient;
    binarySensorTopicBase : string;
    textSensorTopicBase : string;
    deviceName : string;
    brokerUrl : string;
    brokerUsername : string;
    brokerPassword : string;
    brokerDeviceName : string;

    constructor(connectionCallback : MQTTConnectionCallback, propertyMap : Config){
        this.deviceName = propertyMap.MQTT_DEVICE_NAME;
        this.brokerUrl = propertyMap.MQTT_BROKER_URL;
        this.brokerUsername = propertyMap.MQTT_USERNAME;
        this.brokerPassword = propertyMap.MQTT_PASSWORD;
        this.brokerDeviceName = propertyMap.MQTT_DEVICE_NAME;

        this.binarySensorTopicBase = `homeassistant/binary_sensor/${this.deviceName}/status`;
        this.textSensorTopicBase = `homeassistant/sensor/${this.deviceName}/message`;
        
        const clientId : string = `${this.deviceName}_${Math.random().toString(16).slice(2)}`;
        
        const connectionOptions : IClientOptions = { clientId };
        if (this.brokerPassword) {
            connectionOptions.username = this.brokerUsername;
            connectionOptions.password = this.brokerPassword;
        }
        
        this.client = mqtt.connect(this.brokerUrl, connectionOptions);

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
            identifiers: [this.deviceName],
            name: this.deviceName,
            manufacturer: "Nikorag",
            model: "AIHomeCheck"
        }

        // Binary Sensor Discovery
        const binarySensorDiscoveryMessage : MQTTDiscoveryMessage = {
            name: `Status`,
            state_topic: `${this.binarySensorTopicBase}/state`,
            value_template: '{{ value_json.status }}',
            unique_id: `${this.deviceName}_status`,
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
            unique_id: `${this.deviceName}_message`,
            device
        };
        this.client.publish(`${this.textSensorTopicBase}/config`, JSON.stringify(textSensorDiscoveryMessage), {
            retain: true,
        });
    }

    publishSensorReadings({status, message} : AISensorResult){
        this.client.publish(`${this.binarySensorTopicBase}/state`, JSON.stringify({ status : status ? 'ON' : 'OFF' }));
        this.client.publish(`${this.textSensorTopicBase}/state`, JSON.stringify({message}));
    }
}