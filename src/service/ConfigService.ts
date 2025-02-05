import * as nodePersist from 'node-persist';

export interface Config {
    [key: string]: any; // Allow any key-value pair in the config
}

let storage = null as nodePersist.LocalStorage | null;

const configService = {
    async init(): Promise<void> {
        storage = await nodePersist.create({
            dir: 'config', // Choose a directory to store the config data
            stringify: JSON.stringify,
            parse: JSON.parse,
        });

        await storage.init(); // Initialize the storage
    },

    getPropertyMap: async (): Promise<Config> => {
        if (!storage) {
            throw new Error('Config service not initialized. Call init() first.');
        }
        return storage.getItem('config') || {}; // Return an empty object if no config exists
    },

    get: async <T>(key: string, defaultValue?: string): Promise<T | undefined> => {
        if (!storage) {
            throw new Error('Config service not initialized. Call init() first.');
        }
        const config = await configService.getPropertyMap();
        return config[key] || defaultValue;
    },

    set: async (key: string, value: any): Promise<void> => {
        if (!storage) {
            throw new Error('Config service not initialized. Call init() first.');
        }
        const config = (await configService.getPropertyMap()) || {};
        config[key] = value;
        await storage.setItem('config', config);
    },
}

export default configService;