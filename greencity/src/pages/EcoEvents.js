import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateEventModal = ({ onClose, onEventCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: '',
        limit: 50
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', formData);
            alert('Event created successfully!');
            onEventCreated();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create event.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Participant Limit</label>
                            <input type="number" name="limit" value={formData.limit} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required></textarea>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const EcoEvents = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data.events || []);
        setMyRegistrations(response.data.registrations || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAuthenticated]);

  const handleRegister = async (eventId) => {
      if (!isAuthenticated) {
          alert("Please log in to register for events.");
          navigate('/login');
          return;
      }
      try {
          await api.post(`/events/${eventId}/register`);
          alert("Successfully registered for the event!");
          fetchEvents();
      } catch (error) {
          alert(error.response?.data?.message || "Registration failed.");
      }
  };

  if (loading) return <div className="text-center p-10">Loading events...</div>;

  return (
    <div>
      {isModalOpen && <CreateEventModal onClose={() => setIsModalOpen(false)} onEventCreated={fetchEvents} />}
      <PageHeader title="Eco-Events & Campaigns" subtitle="Get involved in your community and make a difference." />
      
      {user?.role === 'admin' && (
        <div className="text-center mb-8">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                + Create New Event
            </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => {
          const isRegistered = myRegistrations.includes(event.id);
          const isFull = event.participants >= event.limit;
          
          return (
            <Card key={event.id} className="flex flex-col">
              <div className="p-6 flex-grow">
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <h3 className="text-xl font-bold text-gray-800 mt-2">{event.title}</h3>
                <p className="text-gray-600 mt-2 flex-grow">{event.description}</p>
              </div>
              <div className="bg-gray-50 p-6">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>Participants: {event.participants} / {event.limit}</span>
                      <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(event.participants / event.limit) * 100}%` }}></div>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleRegister(event.id)}
                    disabled={isRegistered || isFull}
                    className="w-full font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isRegistered ? 'Already Registered' : (isFull ? 'Event Full' : 'Register Now')}
                  </button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

export default EcoEvents; 