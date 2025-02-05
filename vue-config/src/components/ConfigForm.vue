<template>
    <div class="w-full mx-auto">
        <template v-if="step == 1">
            <h1 class="mb-4 text-2xl font-extrabold leading-none tracking-tight">Home Assistant</h1>
            <TextInput name="HOME_ASSISTANT_URL" label="Home Assistant URL" v-model="properties.HOME_ASSISTANT_URL" />
            <TextInput name="ACCESS_TOKEN" label="Home Assistant Token" v-model="properties.ACCESS_TOKEN"
                :hidden="true" />
            <SensorSelect v-if="!homeAssistantInvalid" name="SENSOR_IDS" label="Sensor IDs" v-model="properties.SENSOR_IDS" :options="availableSensors" />
            <div>
                {{ homeAssistantError }}
            </div>
            <div class="flex">
                <div class="w-1/2 p-4">
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        @click="testHA">Test<span class="ml-1" v-if="!homeAssistantInvalid">✅</span></button>
                </div>
                <div class="w-1/2 p-4">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        :disabled="homeAssistantInvalid" @click="nextStep">
                        Next
                    </button>

                </div>
            </div>
        </template>
        <template v-if="step == 2">
            <h1 class="mb-4 text-2xl font-extrabold leading-none tracking-tight">MQTT Broker</h1>
            <TextInput name="MQTT_BROKER_URL" label="MQTT Broker URL" v-model="properties.MQTT_BROKER_URL" />
            <TextInput name="MQTT_DEVICE_NAME" label="MQTT Device Name" v-model="properties.MQTT_DEVICE_NAME" />
            <div>
                {{ mqttError }}
            </div>
            <div class="flex">
                <div class="w-1/3 p-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        :disabled="homeAssistantInvalid" @click="prevStep">Previous</button>
                </div>
                <div class="w-1/3 p-4">
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        @click="testMQTT">Test<span class="ml-1" v-if="!mqttInvalid">✅</span></button>
                </div>
                <div class="w-1/3 p-4">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        :disabled="mqttInvalid" @click="nextStep">
                        Next
                    </button>

                </div>
            </div>
        </template>
        <template v-if="step == 3">
            <h1 class="mb-4 text-2xl font-extrabold leading-none tracking-tight">AI Config</h1>   
            <SelectInput name="AI_SERVICE" label="AI Service" v-model="properties.AI_SERVICE"
                :options="['gemini', 'openai']" />
            <TextInput name="CUSTOM_PROMPT" label="Prompt" v-model="properties.CUSTOM_PROMPT" :text-area="true"/>
            <TextInput v-if="properties.AI_SERVICE == 'openai'" name="OPENAPI_API_KEY" label="OpenAI API Key" v-model="properties.OPENAPI_API_KEY" :hidden="true" />
            <TextInput v-if="properties.AI_SERVICE == 'gemini'" name="GEMINI_API_KEY" label="Gemini API Key" v-model="properties.GEMINI_API_KEY" :hidden="true" />
            <div>
                {{ aiError }}
            </div>
            <div class="flex">
                <div class="w-1/3 p-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        :disabled="homeAssistantInvalid" @click="prevStep">Previous</button>
                </div>
                <div class="w-1/3 p-4">
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        @click="testAI">Test<span class="ml-1" v-if="!aiInvalid">✅</span></button>
                </div>
                <div class="w-1/3 p-4">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        :disabled="aiInvalid" @click="save">
                        Save
                    </button>
                </div>
            </div>
        </template>
    </div>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import TextInput from './TextInput.vue';
import SelectInput from './SelectInput.vue';
import SensorSelect from './SensorSelect.vue';


const properties = ref([]);
const step = ref(1);
const homeAssistantInvalid = ref(true);
const mqttInvalid = ref(true);
const aiInvalid = ref(true);
const availableSensors = ref([]);

const [homeAssistantError, mqttError, aiError] = [ref(""), ref(""), ref("")];

onMounted(async () => {
    const response = await fetch("/api/propertyMap");
    properties.value = await response.json();
});

const nextStep = () => {
    step.value++;
}

const prevStep = () => {
    step.value--;
}

const testHA = async () => {
    const response = await fetch("/api/haTest", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(properties.value)
    });
    const { result, sensors, message } = await response.json();
    if (result) {
        homeAssistantError.value = "";
        homeAssistantInvalid.value = false;
        availableSensors.value = sensors.map(({entity_id}) => entity_id);
    } else {
        homeAssistantError.value = message;
        homeAssistantInvalid.value = true;
    }
}

const testMQTT = async () => {
    const response = await fetch("/api/mqttTest", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(properties.value)
    });
    const { result, message } = await response.json();
    if (result) {
        mqttError.value = "";
        mqttInvalid.value = false;
    } else {
        mqttError.value = message;
        mqttInvalid.value = true;
    }
}

const testAI = async () => {
    const response = await fetch("/api/aiTest", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(properties.value)
    });
    const { result, message } = await response.json();
    if (result) {
        aiError.value = "";
        aiInvalid.value = false;
    } else {
        aiError.value = message;
        aiInvalid.value = true;
    }
}

const save = async () => {
    await fetch("/api/propertyMap", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(properties.value),
    });
    alert("Configuration saved!");
    window.location.href=`${properties.value.HOME_ASSISTANT_URL}/config/integrations/integration/mqtt`;
}

watch(() => properties.value.HOME_ASSISTANT_URL, () => {
    homeAssistantError.value = "";
    homeAssistantInvalid.value = true;
});

watch(() => properties.value.ACCESS_TOKEN, () => {
    homeAssistantError.value = "";
    homeAssistantInvalid.value = true;
});

watch(() => properties.value.MQTT_BROKER_URL, () => {
    mqttError.value = "";
    mqttInvalid.value = true;
});

watch(() => properties.value.AI_SERVICE, () => {
    aiError.value = "";
    aiInvalid.value = true;
});

watch(() => properties.value.OPENAPI_API_KEY, () => {
    aiError.value = "";
    aiInvalid.value = true;
});

watch(() => properties.value.GEMINI_API_KEY, () => {
    aiError.value = "";
    aiInvalid.value = true;
});
</script>