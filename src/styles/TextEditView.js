import { StyleSheet, Dimensions, Platform } from "react-native";

import ThemeValues from '../values/Theme';

export default StyleSheet.create({
    container: {
        backgroundColor: 'rgba(64, 64, 64, 0.7)',
        height: 280,
        width: Dimensions.get("window").width - 60,
        borderRadius: 10,
        padding: 5
    },
    doneButton: {
        position: 'absolute',
        top: 10,
        right: 10
    }

})