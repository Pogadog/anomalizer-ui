import { Platform } from "react-native";
import AppFetch from "../components/AppFetch"

export default async function (path) {

    let endpoint;

    if (Platform.OS === 'web' && !__DEV__) { // use URL host in production web env
        endpoint = window.location.host;
    } else {
        let config = await (await AppFetch('/config.json', { cache: 'force-cache' })).json();
        endpoint = config.endpoint;
    }

    let paths = {
        dashUpdate: '/_dash-update-component',
        ids: '/ids',
        images: '/images',
        refresh: '/refresh',
        chartFigure: '/figure/',
        filter: '/filter',
        serverMetrics: '/server-metrics',
        similar: '/correlate/',
        similarAll: '/correlate/all',
        features: '/features'
    }

    return 'http://' + endpoint + paths[path];

    
}