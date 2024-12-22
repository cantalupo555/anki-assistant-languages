// Import necessary React hooks and components
import React from 'react';

// Import internal components
import AuthWrapper from './components/AuthWrapper';
import AppInner from './AppInner';
import { AppProvider } from './context/selectionContext';

// Define the main App component
const App: React.FC = () => {
    // Wrap the AppInner component with the AuthWrapper to provide authentication
    return (
        <AppProvider> {/* Wrap AuthWrapper with AppProvider */}
            <AuthWrapper>
                <AppInner />
            </AuthWrapper>
        </AppProvider>
    );
};

export default App;
