# AIHomeCheck
Create an HA device via MQTT with AI responses to sensor readings

The purpose of this application is to provide regular AI analysis of metrics from Home Assistant, back into HA as a new device with a "status" and "message" sensor. An example use case of this:

- You have a heart rate monitor providing regular readings throughout the night. You can ask AI to review these readings every 15 minutes and provide you with a summary and whether there is anything to worry about.

This was my personal use case for the application however I decided to write it more open to allow other's to use it in their own way if they find it useful.

## Using AIHomeCheck

### Run Natively

To run AIHomeCheck, run the following commands:

```
npm install
npm run build
npm run start
```

Once the server is up, browse to http://localhost:3000 to configure


## Run with Docker

To run with Docker, run like this:

```
docker build -t aihomecheck .
docker run -d --name aihomecheck -v ./config:/app/config -p 3000:3000 aihomecheck
```

Or using Docker compose

```yaml
services:
  aihomecheck:
    build: .
    container_name: aihomecheck
    volumes:
      - ./config:/app/config
    ports:
      - "3000:3000"
    restart: unless-stopped
```

which can be started with `docker compose up --build`

Once the server is up, browse to http://localhost:3000 to configure, once configured you can recreate the container without exposing 3000 if desired.