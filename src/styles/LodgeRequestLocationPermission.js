import { StyleSheet } from "react-native";
import ThemeValues from '../values/Theme';
import Shadow from "./Shadow";


export default StyleSheet.create({
    container: {
        backgroundColor: ThemeValues.colors.palette.background,
        padding: 10,
        width: '100%'
    },
    beforeText: {
        marginBottom: 20
    },
    cta: {
        marginBottom: 20
    }
})