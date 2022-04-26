import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    scrollContainer: {
        flexGrow: 1,
        height: "100%"
    },
    item: {
        flex: 1
    },
    indicatorContainer: {
        backgroundColor: "rgba(0, 128, 0, 0.5)",
        height: Platform.OS === 'android' ? 22 : 18,
        borderRadius: 5,
        paddingRight: 3,
        paddingLeft: 3
    },
    indicatorText: {
        color: 'white',
    }
})