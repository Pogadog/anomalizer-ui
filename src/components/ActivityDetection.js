import { Platform } from 'react-native';

export default class ActivityDetection {

    constructor(minutes=15) {
        this.timeLimit = minutes * 60 * 1000;
        this.timeout;
        this.moveDelta = 0;
        if (Platform.OS === 'web') {
            document.onmousemove = this.resetActivityTimeout;
        }
    }

    resetActivityTimeout = () => {
        this.moveDelta++;
        if (this.moveDelta > 15) {
            clearTimeout(this.timeout);
            this.onActivity();
            this.start();
            this.moveDelta = 0;
        }
        
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

