


import React, {Component} from 'react';
import { ActivityIndicator, Platform} from 'react-native';
import Theme from '../values/Theme';

import ThemeValues from '../values/Theme';

class Loading extends Component {
    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <ActivityIndicator size={this.props.size || 24} color={this.props.color || ThemeValues.colors.palette.primary} style={this.props.style} />
        );
    }

}

export default Loading;