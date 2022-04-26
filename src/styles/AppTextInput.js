import { Platform, StyleSheet } from "react-native";

import ThemeValues from '../values/Theme';

let baseText = {
    fontFamily: 'Roboto'
}

let main =  {
    borderRadius: 5,
    padding: 5,
    width: '90%',
    height: 40,
}

if (Platform.OS === 'web') {
    main.outlineColor = ThemeValues.colors.palette.primary
}

export default {
    main
}