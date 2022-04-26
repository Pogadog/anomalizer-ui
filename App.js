import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';

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

const Root = createStackNavigator();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {

      ready: false
       
    }
  }

  componentDidMount = async () => {
    await Font.loadAsync(Fonts);
    this.setState(update(this.state, { ready: {$set: true} }));
  }

  render = () => {

    if (!this.state.ready) return null;

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

