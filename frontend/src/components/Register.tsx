// Import necessary libraries
// React: Core library for building user interfaces
// useState: React hook for managing state
import React, { useState } from 'react';
import '../styles/Login.css';
import { RegisterProps } from '../utils/Types';
import useAuth from '../utils/useAuth';

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { handleRegister: authHandleRegister } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await authHandleRegister(username, email, password);
            onRegister(username, email, password);
        } catch (error) {
            console.error('Error during registration:', error);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="register-username">Username:</label>
                        <input
                            type="text"
                            id="register-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-email">Email:</label>
                        <input
                            type="email"
                            id="register-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-password">Password:</label>
                        <input
                            type="password"
                            id="register-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-confirm-password">Confirm Password:</label>
                        <input
                            type="password"
                            id="register-confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" className="login-button">Register</button>
                </form>
            </div>
        </div>
    );
};


export default Register;
