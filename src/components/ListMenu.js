


import React, { Component } from 'react';
import {
    View,
    SafeAreaView,
    TouchableOpacity
} from 'react-native';

import AppText from './AppText';

import ListMenuStyle from '../styles/ListMenu';
import Loading from './Loading';

import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeValues from '../values/Theme';

class ListMenu extends Component {

    render = () => {
        return (
            <View style={{...ListMenuStyle.container, ...this.props.containerStyle}}>
                {this.props.data.length > 0 && !this.props.loading ? 
                    this.props.data.map((i, index, array) => {
                        if (!i) return null;
                        return (
                            <View key={i.id} style={{...ListMenuStyle.option, backgroundColor: i.id === 'cancel' ? 'crimson' : undefined, borderBottomEndRadius: 20, borderBottomStartRadius: 20}}>
                                <TouchableOpacity disabled={i.disabled} style={{...ListMenuStyle.optionInner, opacity: i.disabled ? 0.5 : 1 }} onPress={() => {
                                    this.props.onPress(i.id);
                                }}>
                                    <AppText tag="body" style={{...ListMenuStyle.text, color: i.id === 'cancel' ? 'white' : undefined}}>{i.name}</AppText>
                                </TouchableOpacity>
                                {this.props.actionsLeft && this.props.actionsLeft.map(iconItem => {
                                    return (
                                        <View key={iconItem.icon} style={ListMenuStyle.icon}>
                                            <TouchableOpacity onPress={() => {
                                                iconItem.action(i.id)
                                            }}>
                                                <Ionicons key={iconItem.icon} name={iconItem.icon} size={24} color={ThemeValues.colors.palette.primary} />
                                            </TouchableOpacity>
                                            
                                        </View>
                                    )
                                })}
                                {index < array.length - 1 && <View style={ListMenuStyle.separator}></View>}
                            </View>
                        );
                    })
                : 
                    <View style={ListMenuStyle.option}>
                        <View style={ListMenuStyle.optionInner}>
                            <AppText tag="body" style={ListMenuStyle.text}>{this.props.loading ? <Loading color={ThemeValues.colors.palette.primary} /> : this.props.noData || 'No data'}</AppText>
                        </View>
                    </View>
                }
                
            </View>
        );
    }

}

export default ListMenu;