import { StyleSheet, Platform } from "react-native";
import ThemeValues from '../values/Theme';
import Shadow from './Shadow';

export default {
    container: {
        backgroundColor: ThemeValues.colors.palette.background,
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10,
        flex: 1,
        flexDirection: 'column',
        alignContent: 'flex-start',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginLeft: 10,
        marginRight: 30
    },
    headerText: {
        marginLeft: 5,
        width: '92%',
        color: "#c2c2c2",
    },
    fullContainer: {
        backgroundColor: ThemeValues.colors.palette.background,
        width: '90%',
        marginBottom: 10,
        padding: 10,
        borderBottomWidth: 2,
        borderBottomColor: ThemeValues.colors.palette.primary,

        left: 20,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start'
    }
}