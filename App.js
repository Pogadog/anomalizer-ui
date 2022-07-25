import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/components/Home';
import { Component } from 'react';
import * as Font from 'expo-font';
import Fonts from './src/values/Fonts';
import update from 'immutability-helper';
import { DarkModeContext } from './src/components/DarkModeContext';
import AppFetch from './src/components/AppFetch';
import Logo from './src/images/logo.png';
import ActivityDetection from './src/components/ActivityDetection';
import AppText from './src/components/AppText';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Theme from './src/values/Theme';

const Root = createStackNavigator();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {

      ready: false,
      inactive: false
       
    }
  }

  componentDidMount = async () => {
    await Font.loadAsync(Fonts);
    this.setState(update(this.state, { ready: {$set: true} }));
    this.ad = new ActivityDetection();
    this.ad.onInactivity = () => {
      this.setState(update(this.state, { inactive: {$set: true} }));
    }
    this.ad.onActivity = () => {
      if (Platform.OS === 'web' && window.location) {
        window.location.href = 'https://anomalizer.app';
        this.ad.onActivity = () => null; // prevent replay
      } else {
        this.setState(update(this.state, { inactive: {$set: false} }));
      }
    }
    this.ad.start();
  }

  componentWillUnmount = () => {
    this.ad?.stop();
  }

  render = () => {

    if (!this.state.ready) return null;

    if (this.state.inactive) {
      return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
        <MaterialCommunityIcons name="sleep" color={Theme.colors.palette.primary} size={64} />
        <AppText tag="h1" >Anomalizer is taking a nap</AppText>
        <View style={{ height: 5 }} />
        <AppText tag="h2" >Wiggle your mouse to wake it up</AppText>
        <View style={{ height: 10 }} />
        <MaterialCommunityIcons name="mouse-variant" color={Theme.colors.palette.primary} size={48} />
      </View>
    }

    return <DarkModeContext.Provider value={{ enabled: false, set: mode => {}, get: () => 'auto' }}>
      <NavigationContainer>
        <Root.Navigator screenOptions={({ route, navigation }) => ({ 
            cardStyle: {
              backgroundColor: 'white'
            },
            headerTitleStyle: {
              fontFamily: 'Ubuntu'
            }
        })}>
          <Root.Screen name="Anomalizer by Pogadog" component={Home} options={{ headerLeft: () => {
            return <Image source={Logo} style={{ width: 40, height: 40, marginLeft: 20 }} />
          } }} />
        </Root.Navigator>
      </NavigationContainer>
    </DarkModeContext.Provider>
  }

}

export default App;

