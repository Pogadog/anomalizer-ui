import { StyleSheet } from "react-native";
import ThemeValues from '../values/Theme';


export default {
    container: {
        flex: 1,
        backgroundColor: ThemeValues.colors.palette.background,
        alignItems: 'center',
        justifyContent: 'center'
    },
    barStyles: {
        backgroundColor: ThemeValues.colors.palette.primary,
        height: 50
    }
}