import RandomNumber from "./RandomNumber";



export default async function AppFetch(url, init, retryTimeout=0) {

    let config = await (await fetch('/config.json', { cache: 'force-cache' })).json();

    if (config.useArtificialLatency) {
        await new Promise(res => setTimeout(res, RandomNumber(100, 1500)));
    }

    await new Promise(res => setTimeout(res, retryTimeout));

    let r;
    
    try {
        r = await fetch(url, init);
    } catch (e) {
        console.error(e);
        r = await AppFetch(url, init, retryTimeout < 1000 ? 1000 : retryTimeout * 1.1)
    }

    return r;

}

