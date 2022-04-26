


import React, {Component} from 'react';

import {
    View,
    TouchableOpacity,
    Image,
    Platform,
    Animated,
    Easing
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import AppText from './AppText';

import Loading from './Loading';
import Shadow from '../styles/Shadow';
import { DarkModeContext } from './DarkModeContext';
 
class CTA extends Component {

    constructor(props) {
        super(props);
        this.state = {
            top: new Animated.Value(0),
            scale: new Animated.Value(1)
        }
    }

    componentDidMount = () => {
        
    }

    render() {

        if (this.props.type === 'iconOnly') {
            return (
                <TouchableOpacity style={{width: 50}} disabled={this.props.disabled || this.props.loading} onPress={() => {
                    if (!this.props.disabled && !this.props.loading) this.props.onPress();
                }}>
                    <View style={{width: 50, backgroundColor: this.props.backgroundColor || "#e7e7e7", flexDirection:'row', flexWrap:'wrap', padding: 10, borderRadius: 50, opacity: this.props.disabled ? 0.7 : 1, left: this.props.containerLeft, height: 50, ...Shadow, ...this.props.style}}>

                        {!this.props.loading ? <View style={{flex: 1, justifyContent: "space-evenly", alignItems: "center"}}><Ionicons name={this.props.icon.name} size={24} color={this.props.icon.color || "#666"} /></View> : <Loading color={this.props.loadingColor}/>
                        }
                            
                    </View>
                </TouchableOpacity>
            );
        } else {
            return <DarkModeContext.Consumer>
                {darkMode => {
                    return (
                        <TouchableOpacity disabled={this.props.disabled || this.props.loading} onPress={() => {
                            if (!this.props.disabled && !this.props.loading) this.props.onPress();
                        }} style={{backgroundColor: this.props.fillColor ?? (darkMode.enabled ? "black" : 'white'), borderColor: this.props.backgroundColor || "#e7e7e7", borderWidth: 1, width: "100%", padding: 10, alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', borderRadius: 25, opacity: this.props.disabled ? 0.5 : 1, maxHeight: 50, minHeight: 50, ...this.props.style}}>
                                {!this.props.loading ? 
                                    <AppText darkModeDisabled={this.props.darkModeDisabled} tag={this.props.tag} style={{flex: 1, textAlign: 'center', color: this.props.backgroundColor}}>{this.props.children}</AppText> 
                                    : 
                                    <Loading style={{flex: 1, paddingTop: 3}} color={this.props.backgroundColor}/>
                                }
                                {this.props.icon && <AppText style={{flex: 1, top: Platform.OS === 'android' ? 2 : undefined}}><Ionicons name={this.props.icon.name} size={24} color={this.props.backgroundColor || "#666"} /></AppText>}
                                
                        </TouchableOpacity>
                    );
                }}
            </DarkModeContext.Consumer>
            
        }

    }
}

export default CTA;