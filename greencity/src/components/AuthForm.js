import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';
import api from '../api';

const AuthForm = ({ isLogin }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                if (!formData.email || !formData.password) {
                    throw new Error('Email and password are required.');
                }
                await login(formData.email, formData.password);
                navigate('/tracker');
            } else {
                if (!formData.name || !formData.email || !formData.password) {
                    throw new Error('All fields are required.');
                }
                await api.post('/auth/register', formData);
                alert('Registration successful! Please log in.');
                navigate('/login');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
            style={{ backgroundImage: "url(/images/login_bg.webp)" }}
        >
            <Card className="max-w-md w-full mx-auto bg-white bg-opacity-90 backdrop-blur-sm">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'Login to Your Account' : 'Create a New Account'}</h2>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="name" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" required />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        {isLogin ? (
                            <p className="text-sm text-gray-600">
                                Don't have an account? <NavLink to="/register" className="font-medium text-green-600 hover:text-green-500">Sign up</NavLink>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Already have an account? <NavLink to="/login" className="font-medium text-green-600 hover:text-green-500">Login</NavLink>
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AuthForm;
