import { Platform } from 'react-native'

export default {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.5 : 0.8,
    shadowRadius: Platform.OS === 'ios' ? 1 : 2,
    elevation: 5
}