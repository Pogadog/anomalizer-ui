


import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

import style from '../styles/AppTextInput';
import ThemeValues from '../values/Theme';

import update from 'immutability-helper';
import { DarkModeContext } from './DarkModeContext';
import AppText from './AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import Theme from '../values/Theme';
import Loading from './Loading';

class AppTextInput extends Component {

    constructor(props) {
        super(props);

        this.defaultFontSize = 18;

        this.state = {
            value: '',
            fontSize: this.props.fontSizeAutoAdjust ? this.props.fontSizeAutoAdjust.max || this.defaultFontSize : this.defaultFontSize
        }

        this.ref = null;

    }

    componentDidMount = () => {
        setTimeout(() => {
            this.ref && this.props.autoFocus && this.ref.focus();
            if (this.props.initialValue) {
                this.onChangeText(this.props.initialValue);
                this.setState(update(this.state, {value: {$set: this.props.initialValue}}));
            }
        }, 250);
    }

    componentWillUnmount = () => {
        this.ref && this.ref.blur();
    }

    componentDidUpdate = () => {
        if (this.props.clearSignal) {
            console.log("will clear");
            this.ref.clear();
        }
    }

    onChangeText = (text) => {
        let a = this.props.onChangeText(text);
        let f = this.state.fontSize;
        if (this.props.fontSizeAutoAdjust) {
            if (this.state.value.length > this.props.fontSizeAutoAdjust.thresh) {
                if (f > this.props.fontSizeAutoAdjust.min) {
                    f = this.props.fontSizeAutoAdjust.max - (this.state.value.length - this.props.fontSizeAutoAdjust.thresh)
                }
            } else {
                f = this.props.fontSizeAutoAdjust.max;
            }
        }
        this.setState(update(this.state, {value: {$set: a}, fontSize: {$set: f}}));
    }

    setValue = v => {
        this.setState(update(this.state, {value: {$set: v}}));
        this.props.onChangeText(v);
    }

    focus = () => {
        this.ref.focus();
    }

    render () {
        return <DarkModeContext.Consumer>
            {darkMode => {
                return (
                    <View>
                        {this.props.leftActionComponent && <View style={{ position: 'absolute', top: 0, height: "100%", left: 10, alignItems: 'center', justifyContent: 'center' }} >
                            {this.props.leftActionComponent}
                        </View>}
                        <TextInput 
                            keyboardType={this.props.keyboardType}
                            style={{...style.main, fontSize: this.props.disableAutoFontSize ? this.props.disableAutoFontSize :  this.state.fontSize >= this.props.fontSizeAutoAdjust?.min ? this.state.fontSize : this.props.fontSizeAutoAdjust?.min || this.defaultFontSize, ...this.props.style, color: darkMode.enabled ? "white" : 'black', borderWidth: 1, borderColor: ThemeValues.colors.palette.primary, paddingRight: this.props.action ? 40 : 0, paddingLeft: this.props.leftActionComponent ? this.props.leftActionPadding ?? 40 : 0}}
                            onChangeText={this.onChangeText}
                            value={this.state.value}
                            defaultValue={this.props.initialValue}
                            placeholder={this.props.placeholder || ''}
                            secureTextEntry={this.props.protected}
                            maxLength={this.props.maxLength}
                            multiline={this.props.multiline}
                            numberOfLines={this.props.numberOfLines}
                            ref={ref => {this.ref = ref}}
                            onChange={e => this.props.onChange && this.props.onChange(e)}
                            onContentSizeChange={e => this.props.onContentSizeChange && this.props.onContentSizeChange(e)}
                            autoCapitalize={this.props.autoCapitalize || 'sentences'}
                            autoCorrect={this.props.autoCorrect === false ? this.props.autoCorrect : true}
                            autoCompleteType={this.props.autoCompleteType}
                            placeholderTextColor={this.props.style?.color || "#b7b7b7"} 
                            editable={!this.props.readOnly}
                            onKeyPress={this.props.onKeyPress}
                            onFocus={this.props.onFocus}
                            onBlur={this.props.onBlur}
                        />
                        {this.props.action && <View style={{ position: 'absolute', top: 0, height: "100%", right: 10, alignItems: 'center', justifyContent: 'center' }} >
                            <TouchableOpacity disabled={this.props.actionDisabled || this.props.actionComplete || this.props.actionLoading} onPress={this.props.onAction} >
                                {this.props.actionLoading ? <Loading size={24} /> : this.props.actionComplete ? <Ionicons name={this.props.actionDoneIcon || 'checkmark'} size={24} color={'green'} /> : this.props.noClickAction ? null : <Ionicons name={this.props.action} size={24} color={this.props.actionDisabled ?'gray' : Theme.colors.palette.primary} />}
                            </TouchableOpacity>
                        </View>}
                    </View>
                );
            }}
        </DarkModeContext.Consumer>
        
    }
}

export default AppTextInput;
