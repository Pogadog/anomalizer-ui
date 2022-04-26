import { StyleSheet } from "react-native";

import ThemeValues from '../values/Theme';

export default {
    container: {
        flex: 1
    },
    topic: {
        flex: 0.5,
        
        marginBottom: 20
    },
    messages: {
        flex: 3,
        justifyContent: 'flex-end'
    },
    message: {
        margin: 10,
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white'
    },
    compose: {
        flex: 0.1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 60,
        flexDirection: 'row'
    }
}