import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GlobalStyles } from './styles/GlobalStyles';
import { Preloader } from './components/Preloader';

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
