import { Platform, Dimensions } from "react-native"

export default class WideBody {

    constructor() {
        this.cb = null;
    }

    determine = (width) => {
        return (Platform.OS === 'web' || Platform.isPad) && width > 1140;
    }

    onChange = (event) => {
        this.cb && this.cb(this.determine(event.window.width));
    }

    addListener = (cb) => {
        this.cb = cb;
        Dimensions.addEventListener('change', this.onChange);
        this.onChange({ window: { width: Dimensions.get("window").width } })
    }

    removeListener = () => {
        this.cb = null;
        Dimensions.removeEventListener('change', this.onChange);
    }

    get = () => {
        return this.determine(Dimensions.get('window').width);
    }

};
