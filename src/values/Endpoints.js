import AppFetch from "../components/AppFetch"

export default async function (path) {
    let config = await (await AppFetch('/config.json', { cache: 'force-cache' })).json();

    let endpoint = config.endpoint;

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