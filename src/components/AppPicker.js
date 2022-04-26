import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from './AppText';
import { Ionicons } from '@expo/vector-icons';

import update from 'immutability-helper';
import HoverContextMenu from './HoverContextMenu';
import { DarkModeContext } from './DarkModeContext';

class AppPicker extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showMenu: false
        }
    }

    toggle = () => {
        this.setState(update(this.state, { showMenu: {$set: !this.state.showMenu} }));
    }

    render = () => {
        return <DarkModeContext.Consumer>
            {darkMode => {
                let options = [...this.props.options];
                let currentOption = '';
                for (let option of options) {
                    if (option.id === this.props.currentOption) {
                        currentOption = option.name;
                        break;
                    }
                }
                return <TouchableOpacity disabled={this.props.disabled} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: darkMode.enabled ? 'black' : 'white', borderRadius: 20, paddingLeft: 10, paddingRight: 10, padding: 5, margin: 5, ...this.props.style }} onPress={() => {
                    this.setState(update(this.state, { showMenu: {$set: true} }));
                }} >
                        <AppText tag="body" >{currentOption}</AppText>
                        <Ionicons name="caret-down" size={18} color="#a7a7a7" />
                        <HoverContextMenu 
                            options={options}
                            headerComponent={() => {
                                return <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20, width: "100%" }} >
                                    <AppText tag="h2" style={{ textAlign: 'center' }} >{this.props.pickerName}</AppText>
                                </View>
                            }}
                            show={this.state.showMenu}
                            onAction={action => {
                                this.setState(update(this.state, { showMenu: {$set: false} }), () => {
                                    action !== 'cancel' && this.props.onOptionChange?.(action);
                                })
                            }}
                        />
                </TouchableOpacity>
            }}
        </DarkModeContext.Consumer>
    }

}

export default AppPicker;
