import { StyleSheet, Dimensions, Platform } from "react-native";

import ThemeValues from '../values/Theme';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    camera: {
        flex: 1,
    },
    topBar: {
        position: 'absolute',
        top: 40,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9
    },
    captureContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        bottom: 40
    },
    captureButton: {
        width: 100,
        height: 100,
        backgroundColor: 'transparent',
        borderColor: ThemeValues.colors.palette.secondary,
        borderWidth: 7,
        borderRadius: 100/2
    },
    previewControls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    previewControlsTop: {
        flex: 0.1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        top: 20
    },
    previewControl: {
        padding: 20,
    },
    previewControlTop: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    zoomArea: {
        position: 'absolute',
        width: "100%",
        height: "60%",
        top: 80,
        zIndex: 9
    }

})