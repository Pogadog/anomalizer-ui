import { StyleSheet, Dimensions, Platform } from "react-native";

import ThemeValues from '../values/Theme';
import Shadow from "./Shadow";

export default {
    container: {
        zIndex: 9,
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    inner: {
        justifyContent: 'center',
        height: 40,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: ThemeValues.colors.palette.primary,
        borderRadius: 10,
        ...Shadow
    },
    text: {
        color: ThemeValues.colors.palette.background
    }

}