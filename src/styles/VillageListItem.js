import { StyleSheet } from "react-native";
import ThemeValues from '../values/Theme';
import Shadow from './Shadow';

export default {
    touch: {
        backgroundColor: ThemeValues.colors.palette.background,
        padding: 10,
        borderRadius: 0,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',

    },
    row0: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        minHeight: 25
    },
    row1: {
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    text: {
        color: 'black',
        width: "90%"
    },
    icon: {
        fontSize: 19
    },
    iconGoTo: {
        fontSize: 19,
        top: 2
    }
}