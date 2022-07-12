# Anomalizer UI by Pogadog [Prototype]

This is the user-interface component of the [Anomalizer](https://github.com/pogadog/anomalizer), which provides Prometheus anomaly visualization.

Written in React-Native with Expo infrastructure, the Anomalizer UI is a versatile application. Using mobile-first development paradigms, the Anomalizer UI has a clean and fluid UI that currently runs on Web, with the potential to run on Android and iOS as well.

With its grid-based design and similar metrics feature, the Anomalizer UI aims to create the perfect balance of computer intelligence and the human eye to help find anomalies within your system.

With split-pane views, actionable features, and quick filter mechanisms, the Anomalizer UI helps you find metrics that are important, faster.

The Anomalizer UI follows the Airbus [*dark cockpit*](https://www.icao.int/ESAF/Documents/meetings/2017/AFI%20FOSAS%202017/Day%201%20Docs/Day_1_2_Airbuspihlo.pdf) aircraft design philosophy with its presentation of metrics by visually highlighting metrics you need to know about on its main page, allowing you to identify anomalies in your system within a fraction of a second.

More details on what features can be used with the Anomalizer can be found in its co-dependent repository [here](https://github.com/pogadog/anomalizer) (more about that below).

# Co-dependents

This project is not standalone; it requires the Anomalizer server, which can be boostrapped through its Github project [here](https://github.com/pogadog/anomalizer). 

The Anomalizer server `docker-compose` method contains a Docker image of this project, so you shouldn't need to install this project separately to run it. However, development instructions are below.

# Development

Libraries Needed:
- Node : >=16
- Npm : latest (should come with Node)
- Expo cli : latest (`npm install --save expo-cli`)

### NPM Peer Dependency Notice
The latest versions of NPM have a new form of peer dependency handling where if there is a conflict of peer dependency versions, it will refuse to install anything. Most of these peer dependency errors are from libraries deeply nested in other libraries used by this project; it's an ongoing task to resolve all of these conflicts, and the project should work fine. As a work-around, anytime you want to install anything using `npm install`, add the `--legacy-peer-deps` flag to safely ignore the peer dependency errors for now.

To run in a development environment:
- Clone
- `cd anomalizer-ui`
- `npm install`
- **NEW:** Create a `./src/etc/firebase.web.js` file with your firebase web configuration. The file contents should look like this:
```js
module.exports = {
    apiKey: "...",
    ...
    measurementId: "..."
}
```
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
