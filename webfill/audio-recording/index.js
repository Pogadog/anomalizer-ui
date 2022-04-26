import { isEdge, isFirefox, isOpera } from 'react-device-detect';
import { Platform } from 'react-native';

const { connect } = Platform.OS === 'web' ? require('extendable-media-recorder-wav-encoder') : {};
const { MediaRecorder, register } = Platform.OS === 'web' ? require('extendable-media-recorder') : {};

export class Recording {

    prepareToRecordAsync = async () => {
        try {
            await register(await connect());
        } catch (e) {
            console.warn(e);
        }
        
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.recorder = new MediaRecorder(this.stream, { mimeType: 'audio/wav' });
        this.buffer = [];
        this.recorder.addEventListener('dataavailable', ({ data }) => {
            this.data = data;
        });
        this.recordingDuration = 0;
        this.isRecording = true;
        return true;
    }

    getURI = () => {
        if (this.data) {
            return URL.createObjectURL(this.data);
        } else {
            return '';
        }
    }

    getStatusAsync = async () => {
        return { duration: this.recordingDuration, isRecording: this.isRecording };
    }

    startAsync = async () => {
        if (!this.recorder) {
            console.warn("Recording instance not prepared");
            return false;
        }
        this.durationInterval = setInterval(() => {
            this.recordingDuration += 1000;
        }, 1000);
        this.recorder.start();
    }

    stopAndUnloadAsync = async () => {
        this.isRecording = false;
        if (!this.recorder) {
            console.warn("Recording instance not prepared");
            return false;
        }
        clearInterval(this.durationInterval);
        this.recorder.stop();
        this.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

}

export const requestPermissionsAsync = async () => {
    try {
        let stream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
        stream.getTracks().forEach(function(track) {
            track.stop();
        });
        return {status: 'granted', granted: true, canAskAgain: false}
    } catch (e) {
        return {status: 'denied', granted: false, canAskAgain: false}
    }
    
}

export const getPermissionsAsync = async () => {
    if (isFirefox) {
        return { status: 'denied', canAskAgain: false };
    }

    if (typeof navigator.permissions === 'undefined') {
        return { status: 'denied', granted: false, canAskAgain: false }
    }

    let result = await navigator.permissions.query({name:'microphone'});
    result = {state: result.state};

    if (result.state === 'prompt') result.state = 'pending';
    
    return { status: result.state, canAskAgain: result.state !== 'denied' };
}