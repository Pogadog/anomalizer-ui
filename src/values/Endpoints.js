import { Platform } from "react-native";
import AppFetch from "../components/AppFetch"

export default async function (path) {

    let endpoint;

    let config = await (await AppFetch('/config.json', { cache: 'force-cache' })).json();

    if (config.referToHost) {
        endpoint = window.location.host
    } else {
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

    return ((window?.location?.protocol || 'http:') + '//') + endpoint + paths[path];

    
}