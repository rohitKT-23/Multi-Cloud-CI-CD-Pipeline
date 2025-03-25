import { useEffect, useState } from 'react';
import API from '../services/api';
import StatusCard from '../components/StatusCard'; // This should match

const Dashboard = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await API.get('/cloud/status');
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>Multi-Cloud Service Dashboard</h1>
      <div className="services-grid">
        {services.length > 0 ? (
          services.map((service) => (
            <StatusCard key={service.id} service={service} />
          ))
        ) : (
          <p>Loading services...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;