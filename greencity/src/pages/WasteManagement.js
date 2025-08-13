import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const BulkPickupModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        address: '',
        waste_type: 'E-Waste',
        contact_number: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4" style={{ zIndex: 1000 }}>
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Request Bulk Waste Pickup</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type of Waste</label>
                            <select name="waste_type" value={formData.waste_type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                                <option>E-Waste</option>
                                <option>Garden Waste</option>
                                <option>Construction Debris</option>
                                <option>Large recyclables</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const WasteManagement = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const position = [13.0395, 77.5000];

  useEffect(() => {
    const fetchCenters = async () => {
        try {
            const response = await api.get('/recycling-centers');
            setCenters(response.data || []);
        } catch (error) {
            console.error("Failed to fetch recycling centers:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchCenters();
  }, []);

  const handlePickupSubmit = async (formData) => {
    try {
        await api.post('/waste-pickup', formData);
        alert('Your request has been submitted successfully!');
        setIsModalOpen(false);
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit request.');
    }
  };

  const handleRequestPickup = () => {
      if (!isAuthenticated) {
          alert('Please log in to request a bulk pickup.');
          navigate('/login');
      } else {
          setIsModalOpen(true);
      }
  };

  return (
    <div>
      {isModalOpen && <BulkPickupModal onClose={() => setIsModalOpen(false)} onSubmit={handlePickupSubmit} />}
      <PageHeader title="Waste Management Hub" subtitle="Find facilities and learn how to segregate waste properly." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full p-2">
            {loading ? <p>Loading map...</p> : (
                <MapContainer center={position} zoom={12} style={{ height: '500px', width: '100%', borderRadius: '8px' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {centers.map(center => (
                    <Marker key={center.id} position={[center.latitude, center.longitude]}>
                    <Popup>
                        <span className="font-bold">{center.name}</span><br/>{center.type}
                    </Popup>
                    </Marker>
                ))}
                </MapContainer>
            )}
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Waste Segregation Guide</h3>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <span className="text-2xl mr-3">🍃</span>
                        <span><span className="font-bold">Wet Waste:</span> Cooked/uncooked food, fruits, vegetables, flowers. Use green bin.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-2xl mr-3">♻️</span>
                        <span><span className="font-bold">Dry Waste:</span> Plastic, paper, glass, metal. Use blue bin.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-2xl mr-3">🔋</span>
                        <span><span className="font-bold">Hazardous Waste:</span> Batteries, paint, bulbs, electronics. Store separately.</span>
                    </li>
                </ul>
                <button onClick={handleRequestPickup} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Request Bulk Pickup
                </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default WasteManagement;
