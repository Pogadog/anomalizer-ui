import { Platform } from 'react-native';

export default class ActivityDetection {

    constructor(minutes=15) {
        this.timeLimit = minutes * 60 * 1000;
        this.timeout;
        if (Platform.OS === 'web') {
            document.onmousemove = this.resetActivityTimeout;
        }
    }

    resetActivityTimeout = () => {
        clearTimeout(this.timeout);
        this.onActivity();
        this.start();
    }

    start = () => {
        this.timeout = setTimeout(this.onInactivity, this.timeLimit);
    }

    onActivity = () => null;

    onInactivity = () => null;

    stop = () => {
        clearTimeout(this.timeout);
    }

}

