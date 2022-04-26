import { StyleSheet } from "react-native";

let baseText = {
    fontFamily: 'Roboto'
}

let headerFont = {
    fontFamily: 'Caveat'
}

export default {
    p: {
        ...baseText,
        fontSize: 14
    },
    body: {
        ...baseText,
        fontSize: 18
    },
    h1: {
        ...baseText,
        fontSize: 38,
    },
    h2: {
        ...baseText,
        fontSize: 24
    },
    h3: {
        ...baseText,
        fontSize: 22
    },
    baseText: baseText
}