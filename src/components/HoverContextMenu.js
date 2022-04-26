

import React, { Component } from 'react';

import { View, Modal, TouchableWithoutFeedback, Animated, Easing, Platform, ScrollView, Dimensions, Keyboard, LayoutAnimation, TouchableOpacity } from 'react-native';

import ModalWeb from 'modal-react-native-web';

import ListMenu from './ListMenu';
import WideBody from './WideBody';

import update from 'immutability-helper';
import { DarkModeContext } from './DarkModeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

class HoverContextMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            scale: new Animated.Value(10),
            wideBody: false,
            keyboardHeight: 0
        }
    }

    onKeyboard = e => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState(update(this.state, { keyboardHeight: {$set: Dimensions.get('window').height - e.endCoordinates.screenY} }));
    }

    componentDidMount = () => {
        if (this.props.show) this.goIn();
        this.wideBody = new WideBody().addListener(state => {
            this.setState(update(this.state, {wideBody: {$set: state}}));
        })
        Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', this.onKeyboard);
        Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', this.onKeyboard);

    }

    componentDidUpdate = prev => {
        if (this.props.refresh !== prev.refresh) {
            this.props.onLoad?.();
        }
        if (this.props.show !== prev.show) {
            if (this.props.show) {
                this.goIn();
            } else {
                this.goOut();
            }
        }
    }

    componentWillUnmount = () => {
        Keyboard.removeAllListeners(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow');
        Keyboard.removeAllListeners(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide');

    }

    goIn = () => {
        clearTimeout(this.outTimeout);
        Animated.timing(this.state.scale, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true
        }).start(() => {
            this.props.onLoad?.();
        });
    }

    goOut = () => {
        this.outTimeout = setTimeout(() => {
            Animated.timing(this.state.scale, {
                toValue: 10,
                duration: 0,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true
            }).start();
        }, 500);
        
    }

    determineLib = (children) => {
        if (Platform.OS === 'web') {
            return <ModalWeb
                animationType="fade"
                transparent={true}
                visible={this.props.show}
                onRequestClose={() => this.props.onAction('cancel')}
                >
                    {children}
            </ModalWeb>
        } else {
            return <Modal
                animationType="fade"
                transparent={true}
                visible={this.props.show}
                onRequestClose={() => this.props.onAction('cancel')}
                >
                    {children}
            </Modal>
        }
    }

    render = () => {
        return <DarkModeContext.Consumer>
            {darkMode => {
                return this.determineLib(<Animated.View style={{height: "100%", width: "100%", backgroundColor: 'rgba(128, 128, 128, 0.7)', transform: [{scale: this.state.scale}]}} >
                    <View style={{ height: Dimensions.get("window").height - this.state.keyboardHeight, width: "100%" }} >
                        <ScrollView contentContainerStyle={{height: this.state.keyboardHeight > 0 || this.props.altClose ? undefined : "100%", justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false} >
                            <TouchableWithoutFeedback onPress={() => !this.props.loading && this.props.onAction('cancel')} >
                                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                            </TouchableWithoutFeedback>
                            <View style={{ height: 40 }} />
                            {this.props.headerComponent && <View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: darkMode.enabled ? 'black' : 'white', width: this.state.wideBody ? '40%' : '90%', borderRadius: 20, ...this.props.headerComponentStyle}}>
                                
                                {this.props.altClose && <TouchableOpacity style={{top: 0, right: 0, position: 'absolute', zIndex: 9}} onPress={() => {
                                    this.props.onAction('cancel');
                                }}>
                                    <Ionicons name="close-circle" color="red" size={32} />
                                </TouchableOpacity>}

                                {this.props.topLeft && <View style={{top: 0, left: 0, position: 'absolute', zIndex: 9}}>
                                    {this.props.topLeft()}
                                </View>}

                                {this.props.headerComponent()}
                            </View>}
                            {!this.props.altClose && <ListMenu loading={this.props.loading} containerStyle={{backgroundColor: darkMode.enabled ? 'black' : 'white', width: this.state.wideBody ? '40%' : '90%'}} data={this.props.options} noData="No options available" onPress={this.props.onAction} />}
                            <View style={{ height: 80 }} />
                        </ScrollView>
                    </View>
                </Animated.View>)
            }}
        </DarkModeContext.Consumer>
    }

}

export default HoverContextMenu
