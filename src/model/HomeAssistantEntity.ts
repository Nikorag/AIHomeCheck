export interface HomeAssistantEntity {
    entity_id: string;
    state: string;
    attributes: HomeAssistantAttributes;
}

interface HomeAssistantAttributes {
    [key: string]: any;
}