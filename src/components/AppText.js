import { Text } from "react-native";

export default function (props) {

    let fontSize =  (() => {
        switch (props.tag) {
            case 'h1':
                return 48;
            case 'h2':
                return 36;
            case 'h3':
                return 26;
            case 'h4':
                return 22;
            default: 
                return 14;
        }
    })()

    return <Text style={{ 
        fontFamily: props.tag === 'pre' ? 'Mono' : 'Ubuntu',
        fontSize,
        ...props.style
    }} >{props.children}</Text>

}

