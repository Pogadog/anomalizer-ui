import { View, TouchableOpacity } from "react-native";

import Ionicons from '@expo/vector-icons/Ionicons';
import Theme from "../values/Theme";
import AppText from "./AppText";
import { useState } from "react";



export default function (props) {

    let [pressing, setPressing] = useState(false)

    return <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', margin: pressing ? 0 : 1, borderWidth: pressing ? 2 : 1, borderColor: Theme.colors.palette.primary, borderRadius: 9999, padding: 5, paddingLeft: 10, paddingRight: 10 }} onPress={props.onPress} onPressIn={() => {
        setPressing(true);
    }} onPressOut={() => {
        setPressing(false);
    }} >
        {props.icon && <Ionicons name={props.icon.name} size={24} color={Theme.colors.palette.primary} />}
        <View style={{ width: 5 }} />
        <AppText style={{ color: 'purple', fontSize: 18 }} >{props.name}</AppText>
    </TouchableOpacity>

}

