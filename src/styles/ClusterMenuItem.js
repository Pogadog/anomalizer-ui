import { StyleSheet } from "react-native";

import ThemeValues from '../values/Theme';

let base = {
    backgroundColor: ThemeValues.colors.palette.header,
    color: 'black',
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5
}

export default {
    main: base,
    selected: {
        ...base,
        backgroundColor: ThemeValues.colors.palette.primary,
        color: 'white'
    }
};