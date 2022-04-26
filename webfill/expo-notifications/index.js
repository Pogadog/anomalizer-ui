import { isSafari } from "react-device-detect";
import ApplicationServerPublicKey from "../../src/etc/ApplicationServerPublicKey";

export const getPermissionsAsync = async () => {
    if (typeof Notification === 'undefined' || isSafari) {
        return { status: 'denied', granted: false, canAskAgain: false }
    }
    return { status: Notification.permission, granted: Notification.permission === 'granted' }
}

export const requestPermissionsAsync = async () => {
    if (typeof Notification === 'undefined' || isSafari) {
        return { status: 'denied', granted: false, canAskAgain: false }
    }
    let status = await Notification.requestPermission();
    return { status, granted: status === 'granted' }
}

export const getExpoPushTokenAsync = async () => {
    if (typeof Notification === 'undefined' || isSafari) {
        return { data: null }
    }
    if (Notification.permission === 'granted') {
        let registration = await navigator.serviceWorker.register('/ww/push.js');
        await registration.update();
        let pushSub = await registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: ApplicationServerPublicKey});
        return { data: JSON.stringify(pushSub) }
    }
}

export const setNotificationHandler = () => {
    return null;
}

export const addNotificationResponseReceivedListener = () => {
    // communicate with foreground notification listener here
    return null;
}