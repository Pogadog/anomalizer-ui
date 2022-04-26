import { StyleSheet } from "react-native";

import ThemeValues from '../values/Theme';

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    label: {
        top: '2%',
        marginRight: 10
    },
    input: {
        borderRadius: 5,
        padding: 5,
        backgroundColor: ThemeValues.colors.palette.header,
        height: 40,
        minWidth: 40,
        color: 'black'
    },
    actions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        left: 5
    },
    action: {
        top: "1%",
        marginLeft: 5
    }
})