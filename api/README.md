# API

## Run locally

### Docker

First keep sure to have Docker installed, as described here: https://docs.docker.com/install/

Then run [docker-compose](https://docs.docker.com/compose/) by

```bash
docker-compose up
```

from [api](./) subfolder inside the command line / terminal.

After containers have been booted (this may take some time), you should be able ...

* ... to access the Swagger documentation by opening http://localhost/swagger in your browser
* ... to open test UI by opening http://localhost:8080/ in your browser

The key for accessing the API locally is `ego` by default. You can change the setting in your [./.env](.env) file (changes require a restart of your docker containers).

#### Environment variables

| Name | Description | Example |
|---|---|---|
| `API_KEY` | Custom API key. | `myAPIKey` |
| `APP_PORT` | The TCP port of the backend running in container. | `80` |
| `LOCAL_DEVELOPMENT` | Indicates if backend is running in local development mode, which produces more debug output. | `true` |
| `MONGO_DB` | Name of the MongoDB database. | `vehicle_booking_api` |
| `MONGO_HOST` | Address of the MongoDB host. | `mongo` |
| `MONGO_OPTIONS` | Additional options for a MongoDB connection. | `?useNewUrlParser=true` |
| `MONGO_PASSWORD` | Password for accessing the MongoDB. |  |
| `MONGO_PORT` | TCP port of the MongoDB host. | `27017` |
| `MONGO_USER` | User for accessing the MongoDB. |  |
| `TEAM_NAME` | Default team name. | `e.GO Digital` |
