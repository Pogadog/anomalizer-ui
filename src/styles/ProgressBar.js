import { StyleSheet } from "react-native";

import ThemeValues from '../values/Theme';

export default {
    container: {
        width: "100%",
        height: 20,
        backgroundColor: ThemeValues.colors.palette.header,
        borderRadius: 10
    },
    inner: {
        height: "100%",
        backgroundColor: ThemeValues.colors.palette.primary,
        borderRadius: 10
    }
}