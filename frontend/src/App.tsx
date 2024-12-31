// Import necessary React hooks and components
import React from 'react';

// Import internal components
import AuthWrapper from './components/AuthWrapper';
import AppInner from './AppInner';
import { AppProvider } from './context/selectionContext';

// Import styles
import * as S from './styles/AppStyles';

// Define the main App component
const App: React.FC = () => {
    // Wrap the AppInner component with the AuthWrapper to provide authentication
    return (
        <S.GlobalStyles> {/* Apply global styles */}
            <AppProvider> {/* Wrap AuthWrapper with AppProvider */}
                <AuthWrapper>
                    <AppInner />
                </AuthWrapper>
            </AppProvider>
        </S.GlobalStyles>
    );
};

export default App;
