# Anomalizer UI by Pogadog

Needed:
- Expo cli : latest
- Npm : latest
- Node : >=16

To run in a development environment:
- Clone
- `cd anomalizer-ui`
- `npm install`
- Start your Docker instances for the backend. Assuming that the backend endpoint is http://localhost:8057
- `expo start -w`
- You can adjust the backend endpoint and other variables in the web/config.json file. See `Docker Env Variables` for more info

Docker:
- If you require and have write access to the Docker repository on Github, enter your PAT into a file called `dockerToken` that you need to create in the project folder, and your Github username into a file called `dockerUsername` in the project folder
- Enter your docker target into the `dockerTarget` file. For example, enter `ghcr.io/pogadog/anomalizer-ui:latest` into the file as the target for the Github registry.
- Run `npm run docker`
- See the `scripts.docker` value in `package.json` for the default docker run command.


## Docker Env Variables:
- `ENDPOINT=host:port` ~ Set the endpoint for accessing the Anomalizer backend
- `USE_ARTIFICIAL_LATENCY=true|false` ~ Set up artificial latency between frontend/backend communication to simulate latencies over a real network

You can set these values manually in the `web/config.json` file for a development environment

## Performance Notice
The production build of the app is significantly more performant than the development build. If you're having performance issues with the web app's UI, run `expo build:web && npx serve web-build` instead of `expo start -w`. **You can't live develop code while running the production build.** If you don't have `npx serve` installed, you can install it by running `npm install serve --save`.
