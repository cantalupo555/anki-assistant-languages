// Import necessary libraries
// React: Core library for building user interfaces
// useState: React hook for managing state
import React, { useState } from 'react';
import '../styles/Login.css';
import { RegisterProps } from '../utils/Types';

// Define the Register component, which handles user registration
const Register: React.FC<RegisterProps> = ({ onRegister }) => {
    // State variables to store form input values
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // State variable to store any error messages
    const [error, setError] = useState<string | null>(null);

    // Function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission behavior
        setError(null); // Clear previous errors

        // Check if all fields are filled
        if (!username || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        // Check if the password is at least 8 characters long
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        // Check if the password and confirm password fields match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Call the onRegister function passed as a prop, passing the form data
        onRegister(username, email, password);
    };

    // Render the registration form
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
