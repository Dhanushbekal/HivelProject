import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the correct import for React 18+
import { Provider } from 'react-redux'; // Import Provider from react-redux
import { store } from './features/store'; // Import your Redux store
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Create root
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrap App with Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
