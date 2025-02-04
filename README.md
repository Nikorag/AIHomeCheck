# AIHomeCheck
Create an HA device via MQTT with AI responses to sensor readings

The purpose of this application is to provide regular AI analysis of metrics from Home Assistant, back into HA as a new device with a "status" and "message" sensor. An example use case of this:

- You have a heart rate monitor providing regular readings throughout the night. You can ask AI to review these readings every 15 minutes and provide you with a summary and whether there is anything to worry about.

This was my personal use case for the application however I decided to write it more open to allow other's to use it in their own way if they find it useful.

## Using AIHomeCheck

To Configure AI Home Check, you need to ensure the following environment variables are set:

|Variable|Description|Example|
|--|--|--|
HOME_ASSISTANT_URL|URL to your home assistant instance for polling metrics|http://localhost:8123|
ACCESS_TOKEN|Home Assistant Long Lived Token for polling metrics||
SENSOR_IDS|Comma separated list of sensor entities to poll|sensor.owlet_baby_care_sock_heart_rate,sensor.owlet_baby_care_sock_sleep_state|
GEMINI_API_KEY|API Key for Google Generative AI||
MQTT_BROKER_URL|MQTT Broker URL|mqtt://localhost:1883|
MQTT_DEVICE_NAME|The name of the device to create in MQTT||
CUSTOM_PROMPT|The AI Prompt to use|This is 15 minutes of my son's heart rate monitor, While sleeping his heart rate usually sits between 90 and 121. If you see any consistent readings above this range please let me know. Included is also his sleep state readings so please only consider these as worrisome if he is asleep|

### AI Settings

Currently only openai and gemini are supported. the following properties are required for each

|Variables|Description|Example|
|--|--|--|
|AI_SERVICE|Which AI Service to use|`openai` or `gemini` - Default: `openai`|
|OPENAI_API_KEY|API Key for OpenAI||
|OPENAI_MODEL|Open AI Model to use|Default: `gpt-4o`|
|GEMINI_API_KEY|API Key for Gemini||
|GEMINI_MODEL|Gemini AI Model to use|Default: `gemini-1.5-flash`|

You can set these either directly into your shell or into an environment file.

## Run Natively

To run AIHomeCheck, the easiest way is to put your environment variables into a file called `.env` within the directory and run the following commands:

```
npm install
npm run start
```

## Run with Docker

To run with Docker, ensure your variables are in a file and run like this:

```
docker build -t aihomecheck .
docker run -d --name aihomecheck --env-file <env-file> aihomecheck
```