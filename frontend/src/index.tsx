import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const checkStylesLoaded = () => {
  const styles = document.styleSheets;
  for (let i = 0; i < styles.length; i++) {
    if (styles[i].href && !styles[i].cssRules) {
      return false; // Stylesheet ainda não carregado
    }
  }
  return true; // Todos os estilos carregados
};

const waitForStyles = () => {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (checkStylesLoaded()) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
};

window.addEventListener('load', async () => {
  await waitForStyles(); // Espera todos os estilos carregarem
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('loaded');
    setTimeout(() => {
      preloader.remove();
    }, 500);
  }
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
