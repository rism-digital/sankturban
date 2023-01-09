import React from 'react';
import { createRoot } from 'react-dom/client';

import Router from './app/Router.jsx';

import GlobalState from './app/context/GlobalState.jsx';
import { initI18N } from './app/i18n/index.js';

const App = () => (
    <GlobalState>
        <Router />
    </GlobalState>
);

export const renderApp = () => {
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
};

initI18N().then(renderApp());