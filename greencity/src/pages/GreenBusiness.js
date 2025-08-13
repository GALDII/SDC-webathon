import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import RegisterBusiness from '../components/RegisterBusiness';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const ReviewModal = ({ business, onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [review_text, setReviewText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, review_text });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Review: {business.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Rating</label>
                        <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full p-2 border rounded">
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r>1 && 's'}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Review</label>
                        <textarea value={review_text} onChange={(e) => setReviewText(e.target.value)} className="w-full p-2 border rounded" rows="4" placeholder="Share your experience..."></textarea>
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit Review</button>
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const GreenBusiness = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    
    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/businesses');
            setBusinesses(response.data || []);
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
            setBusinesses([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchBusinesses();
    }, []);

    const handleReviewSubmit = async (reviewData) => {
        try {
            await api.post(`/businesses/${selectedBusiness.id}/reviews`, reviewData);
            alert('Review submitted successfully!');
            fetchBusinesses(); // Refresh data to show new average rating
            setSelectedBusiness(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review.');
        }
    };

    const categories = ['All', ...new Set(businesses.map(b => b.category))];
    const filteredBusinesses = filter === 'All' ? businesses : businesses.filter(b => b.category === filter);

    if (loading) return <div className="text-center p-10">Loading businesses...</div>;

    return (
        <div>
            {selectedBusiness && (
                <ReviewModal 
                    business={selectedBusiness} 
                    onClose={() => setSelectedBusiness(null)} 
                    onSubmit={handleReviewSubmit}
                />
            )}
            {isRegisterModalOpen && (
                <RegisterBusiness
                    onClose={() => setIsRegisterModalOpen(false)}
                    onBusinessRegistered={fetchBusinesses}
                />
            )}

            <PageHeader title="Green Business Directory" subtitle="Support local businesses committed to sustainability." />
            
            <div className="text-center mb-8">
                {isAuthenticated && (
                    <button onClick={() => setIsRegisterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform hover:scale-105">
                        + Register Your Business
                    </button>
                )}
            </div>

            <div className="mb-8 flex justify-center">
                <div className="flex flex-wrap justify-center gap-2 bg-gray-200 p-2 rounded-lg">
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === category ? 'bg-white text-green-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBusinesses.length > 0 ? filteredBusinesses.map(business => (
                    <Card key={business.id} className="flex flex-col justify-between">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800">{business.name}</h3>
                                {business.average_rating && (
                                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        ⭐ {Number(business.average_rating).toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-green-700 mt-1">{business.category}</p>
                            <p className="text-gray-600 mt-4">{business.description}</p>
                        </div>
                        <div className="bg-gray-50 p-4">
                            <button 
                                onClick={() => isAuthenticated ? setSelectedBusiness(business) : alert('Please log in to leave a review.')}
                                className="w-full text-center text-sm font-medium text-green-700 hover:text-green-900"
                            >
                                View / Add Reviews
                            </button>
                        </div>
                    </Card>
                )) : (
                    <p className="col-span-full text-center text-gray-500">No businesses found for this category.</p>
                )}
            </div>
        </div>
    );
};
export default GreenBusiness;
