// Import necessary React hooks and components
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import internal components
import AuthWrapper from './components/AuthWrapper';
import AppInner from './AppInner';
import UserSettings from './components/UserSettings';
import { AppProvider } from './context/selectionContext';

// Import styles
import * as S from './styles/AppStyles';

// Define the main App component
const App: React.FC = () => {
    // Wrap the AppInner component with the AuthWrapper to provide authentication
    return (
        <S.GlobalStyles> {/* Apply global styles */}
            <AppProvider> {/* Wrap AuthWrapper with AppProvider */}
                <Router>
                    <AuthWrapper>
                        <Routes>
                            <Route path="/" element={<AppInner />} />
                            <Route path="/stats" element={<AppInner showStats={true} />} />
                            <Route path="/settings" element={<UserSettings />} />
                        </Routes>
                    </AuthWrapper>
                </Router>
            </AppProvider>
        </S.GlobalStyles>
    );
};

export default App;
