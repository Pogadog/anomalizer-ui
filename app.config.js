import firebaseWeb from './src/etc/firebase.web';

export default {
  "expo": {
    "name": "Anomalizer",
    "slug": "anomalizer", 
    "version": "0.0.1",
    "orientation": "portrait",
    "icon": "./src/images/logo.png",
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./src/images/logo.png",
      "config": {
        "firebase": firebaseWeb
      }
    }
  }
}
