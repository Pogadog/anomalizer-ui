import { Dimensions, StyleSheet } from "react-native";

import ThemeValues from '../values/Theme';

export default {
    container: {
        backgroundColor: ThemeValues.colors.palette.background,
        width: "90%",
        flex: 1,
        padding: 20,
        borderRadius: 10
    },
    inner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
    },
    addMediaText: {
        color: 'white'
    },
    item: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ThemeValues.colors.palette.primary,
        borderRadius: 10,
        padding: 10,
        width: "100%",
        marginTop: 15
    },
    imageWrapper: {
        width: '45%',
        height: 120,
        margin: "2%",
        marginTop: 15
    },
    image: {
        width: '100%',
        height: 100,
        borderRadius: 10
    },
    video: {
        width: '100%',
        height: 70,
    },
    caption: {
        padding: 5,
        margin: 5,
        borderRadius: 10
    }
};