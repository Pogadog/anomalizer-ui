CONFIG="{ \"endpoint\": \"${ENDPOINT:-localhost:8054}\", \"useArtificialLatency\": ${USE_ARTIFICIAL_LATENCY:-false}}" 
echo $CONFIG > ~/web-build/config.json
echo "Front-end environment config set as follows:"
echo $CONFIG
echo "\nNOTICE: The following port for 'accepting connections' is only reflective of the internal routing. Do not set the PORT environment variable. Instead, map the internal 3001 to an external port of your choice with the docker command (-p 80:3001/tcp) if 3001 is not available for external routing.\n"
npx serve web-build