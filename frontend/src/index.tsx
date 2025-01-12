// Import necessary React components
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import internal components
import App from './App';
import { Preloader } from './components/Preloader';

// Import styles
import { GlobalStyles } from './styles/GlobalStyles';

// Import utility functions
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Removemos a lógica de handleLoad pois agora está no componente Preloader

root.render(
  <React.StrictMode>
    <GlobalStyles />
    <Preloader />
    <App />
  </React.StrictMode>
);

reportWebVitals();
