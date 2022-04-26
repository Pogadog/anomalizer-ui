import { StyleSheet, Platform } from "react-native";

import ThemeValues from '../values/Theme';

export default {
    container: {
        backgroundColor: ThemeValues.colors.palette.background,
        alignItems: 'center',
        width: 'auto',
        borderRadius: 20,
        top: 20,
        marginLeft: 20,
        marginRight: 20
    },
    option: {
        width: "100%",
        height: 50,
    },
    optionInner: {
        width: "100%",
        padding: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'

    },
    text: {
        textAlign: 'center',
        height: 50,
        marginTop: Platform.OS === 'ios' ? 30 : Platform.OS !== 'web' ? 25 : 0
    },
    icon: {
        position: 'absolute',
        top: 12,
        right: 20
    },
    separator: {
        backgroundColor: "#c7c7c7",
        height: 1,
        width: "100%"
    }
}