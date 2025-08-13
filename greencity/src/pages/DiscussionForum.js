import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Modal component for creating a new post
const NewPostModal = ({ board, onClose, onPostCreated }) => {
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/forum/posts', { ...formData, board });
            alert('Post submitted for approval!');
            onPostCreated();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create post.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">Create New Post in {board}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows="6" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required></textarea>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DiscussionForum = () => {
    const [posts, setPosts] = useState([]);
    const [userVotes, setUserVotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeBoard, setActiveBoard] = useState('Transport');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const boards = ['Transport', 'Housing', 'Energy', 'Water'];

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/forum/posts?board=${activeBoard}`);
            setPosts(response.data.posts || []);
            setUserVotes(response.data.userVotes || {});
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [activeBoard, isAuthenticated]);

    const handleVote = async (postId, vote_type) => {
        if (!isAuthenticated) {
            alert('Please log in to vote.');
            navigate('/login');
            return;
        }
        try {
            await api.post(`/posts/${postId}/vote`, { vote_type });
            fetchPosts(); // Refresh posts to show new vote count and user's vote
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to vote.');
        }
    };

    return (
        <div>
            {isModalOpen && <NewPostModal board={activeBoard} onClose={() => setIsModalOpen(false)} onPostCreated={fetchPosts} />}
            <PageHeader title="Discussion Forum" subtitle="Collaborate on solutions for a better city." />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <div className="p-4">
                            <h3 className="font-bold mb-2">Boards</h3>
                            <ul className="space-y-1">
                                {boards.map(board => (
                                    <li key={board}>
                                        <button 
                                            onClick={() => setActiveBoard(board)}
                                            className={`w-full text-left block p-2 rounded transition-colors ${activeBoard === board ? 'bg-green-100 font-semibold text-green-800' : 'hover:bg-gray-100'}`}
                                        >
                                            {board}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{activeBoard}</h2>
                        {isAuthenticated && (
                            <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md transition-transform hover:scale-105">
                                New Post
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {loading ? <p>Loading posts...</p> : posts.length > 0 ? posts.map(post => (
                            <Card key={post.id} className="p-4 flex items-start space-x-4">
                                <div className="flex flex-col items-center space-y-1 pt-1">
                                    <button onClick={() => handleVote(post.id, 'up')} className={`p-1 rounded transition-colors ${userVotes[post.id] === 'up' ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                                        <ArrowUp size={20} />
                                    </button>
                                    <span className="font-bold text-lg text-gray-700">{post.score}</span>
                                    <button onClick={() => handleVote(post.id, 'down')} className={`p-1 rounded transition-colors ${userVotes[post.id] === 'down' ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}>
                                        <ArrowDown size={20} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Posted by {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                                </div>
                            </Card>
                        )) : (
                            <p className="text-center text-gray-500 py-8">No posts in this board yet. Be the first to start a discussion!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DiscussionForum;
