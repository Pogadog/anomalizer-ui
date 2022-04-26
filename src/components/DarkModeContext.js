import React from 'react';

export const DarkModeContext = React.createContext({ enabled: false, set: mode => {}, get: () => 'auto' })

