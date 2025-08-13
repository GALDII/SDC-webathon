import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const CitizenActionTracker = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();
    
    const actionOptions = [
        { name: 'Used public transport', points: 5 },
        { name: 'Reduced electricity usage', points: 15 },
        { name: 'Planted a tree', points: 20 },
        { name: 'Attended a workshop', points: 30 }
    ];

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const handleLogAction = async (e) => {
        e.preventDefault();
        const points = e.target.elements.action.value;
        try {
            await api.post('/actions/log', { points });
            alert(`Action logged! You earned ${points} points.`);
            fetchLeaderboard(); // Refresh leaderboard
        } catch (error) {
            alert("Failed to log action.");
        }
    };

    if (loading) return <div className="text-center p-10">Loading leaderboard...</div>;

    return(
        <div>
            <PageHeader title="Citizen Action Tracker" subtitle="See how our community is making an impact!" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Log a New Action</h3>
                            {isAuthenticated ? (
                                <form className="space-y-4" onSubmit={handleLogAction}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Action Type</label>
                                        <select name="action" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                                            {actionOptions.map(opt => <option key={opt.name} value={opt.points}>{opt.name} (+{opt.points} points)</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Log Action</button>
                                </form>
                            ) : (
                                <p className="text-gray-600">Please log in to track your actions.</p>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Community Leaderboard</h3>
                            <ul className="space-y-3">
                                {leaderboard.map((u, index) => (
                                    <li key={u.id} className={`flex items-center justify-between p-3 rounded-lg ${u.id === user?.id ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-500 w-8">{index + 1}</span>
                                            <span className="font-medium text-gray-800">{u.name} {u.id === user?.id && '(You)'}</span>
                                        </div>
                                        <span className="font-bold text-green-600">{u.points} points</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default CitizenActionTracker;
