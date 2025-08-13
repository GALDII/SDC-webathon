import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, pendingItems: 0 });
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/dashboard-stats'),
                api.get('/admin/pending-items')
            ]);
            setStats(statsRes.data);
            setPendingItems(pendingRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);
    
    const handleApprove = async (itemType, itemId) => {
        try {
            await api.post(`/admin/approve/${itemType}/${itemId}`);
            alert(`${itemType} approved successfully!`);
            fetchData(); // Refresh data
        } catch (error) {
            alert(`Failed to approve ${itemType}.`);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }
    
    if (loading) return <div className="text-center p-10">Loading dashboard...</div>;

    return (
        <div>
            <PageHeader title="Admin Dashboard" subtitle={`Welcome, ${user.name}. Manage the platform here.`} />
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                    <h3 className="text-4xl font-bold text-blue-600">{stats.totalUsers}</h3>
                    <p className="text-gray-500 mt-2">Total Users</p>
                </Card>
                <Card className="p-6 text-center">
                    <h3 className="text-4xl font-bold text-green-600">{stats.totalEvents}</h3>
                    <p className="text-gray-500 mt-2">Approved Events</p>
                </Card>
                 <Card className="p-6 text-center">
                    <h3 className="text-4xl font-bold text-yellow-600">{stats.pendingItems}</h3>
                    <p className="text-gray-500 mt-2">Pending Approvals</p>
                </Card>
            </div>

            {/* Approval Queue */}
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Approval Queue</h3>
                    {pendingItems.length > 0 ? (
                        <ul className="space-y-3">
                            {pendingItems.map(item => (
                                <li key={`${item.type}-${item.id}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="capitalize font-semibold text-gray-500 mr-4">{item.type}</span>
                                        <span className="font-medium text-gray-800">{item.title}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleApprove(item.type, item.id)}
                                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded"
                                    >
                                        Approve
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No items are currently pending approval.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};
export default AdminDashboard;
