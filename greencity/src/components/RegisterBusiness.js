import React, { useState } from 'react';
import api from '../api';

const RegisterBusiness = ({ onClose, onBusinessRegistered }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Organic Food',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/businesses', formData);
            alert('Business submitted for approval!');
            onBusinessRegistered();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit business.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Register Your Green Business</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                            <option>Organic Food</option>
                            <option>Renewable Energy</option>
                            <option>Eco-friendly Packaging</option>
                            <option>Transport</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required></textarea>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterBusiness;
