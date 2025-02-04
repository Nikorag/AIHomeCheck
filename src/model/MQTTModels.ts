export interface MQTTDevice {
    identifiers : string[],
    name: string,
    manufacturer: string,
    model: string
}

export interface MQTTDiscoveryMessage {
    name: string,
    state_topic: string,
    value_template: string,
    unique_id: string,
    device : MQTTDevice
}