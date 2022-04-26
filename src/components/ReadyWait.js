


import React, {Component, Fragment} from 'react';

import { View } from 'react-native';
import Loading from './Loading';

import ThemeValues from '../values/Theme';
import AppText from './AppText';

import Ionicons from '@expo/vector-icons/Ionicons';
import CTA from './CTA';
import Theme from '../values/Theme';
import update from 'immutability-helper';

/**
 * Wait screen for ready state
 */

class ReadyWait extends Component {

    constructor(props) {
        super(props);
        this.state = {
            shouldRetry: false,
            networkGood: false
        }
    }

    render = () => { 
        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <Loading size={44} color={ThemeValues.colors.palette.primary} />
                <View style={{ height: 10 }} />
                {this.props.text && <AppText tag="h4" style={{ textAlign: 'center' }} >{this.props.text}</AppText>}
            </View>
        );
    }
}

export default ReadyWait;