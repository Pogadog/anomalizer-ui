import { StyleSheet, Platform } from "react-native";

let actionsTop = Platform.OS === 'ios' ? 20 : 50;

export default StyleSheet.create({
    container: {
        backgroundColor: '#e7e7e7',
        height: Platform.OS === 'ios' ? 60 : 100,
        width: '100%'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        flexGrow: 1,
    },
    mainText: {
        top: Platform.OS === 'ios' ? 10 : 40,
        left: 20,
        width: '90%',
        height: 50
    },
    actions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        right: 10,
        top: actionsTop
    },
    actionsLeft: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        left: 0,
        top: actionsTop
    },
    action: {
        marginLeft: 10,
        width: 25
    }
})