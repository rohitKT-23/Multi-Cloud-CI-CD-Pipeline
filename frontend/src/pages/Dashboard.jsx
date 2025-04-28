import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Cloud, Server, DollarSign } from 'lucide-react';
import StatusCard from '../components/StatusCard';
import { useAuth } from '../context/context/AuthContext';
import { getCloudServices } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const servicesData = await getCloudServices();
      setServices(servicesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch services. Please try again later.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Calculate totals with fallback to 0 if costs are undefined
  const totalCurrentCost = services.reduce((sum, s) => sum + (s.cost?.current || 0), 0);
  const totalPreviousCost = services.reduce((sum, s) => sum + (s.cost?.previous || 0), 0);
  const totalForecastCost = services.reduce((sum, s) => sum + (s.cost?.forecast || 0), 0);
  const costTrend = totalCurrentCost > totalPreviousCost ? 'up' : 'down';
  const costDiff = Math.abs(totalCurrentCost - totalPreviousCost).toFixed(2);
  const costPercentChange = totalPreviousCost > 0 
    ? ((totalCurrentCost - totalPreviousCost) / totalPreviousCost * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cloud Services Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor your cloud infrastructure in real-time
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchServices}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-6">
            {services.map(service => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StatusCard service={service} />
              </motion.div>
            ))}
          </div>

          {isLoading && services.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!isLoading && services.length === 0 && (
            <div className="text-center py-20">
              <Cloud className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your cloud services.</p>
            </div>
          )}

          {services.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {service.name}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Current</span>
                        <span className="text-gray-900 font-bold">
                          ${service.cost?.current?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Previous</span>
                        <span className="text-gray-900 font-bold">
                          ${service.cost?.previous?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Forecast</span>
                        <span className="text-gray-900 font-bold">
                          ${service.cost?.forecast?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Combined Total Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500">Total Current</h3>
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalCurrentCost.toFixed(2)}
                    </p>
                    <div
                      className={`flex items-center text-sm ${
                        costTrend === 'up' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      <span>{costTrend === 'up' ? '↑' : '↓'} ${costDiff}</span>
                      <span className="ml-1">({costPercentChange}%)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500">Total Previous</h3>
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalPreviousCost.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500">Total Forecast</h3>
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalForecastCost.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Estimated for next month</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;