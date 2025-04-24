import { useState } from 'react';
import { Server, Clock, AlertCircle, BarChart } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const StatusCard = ({ service }) => {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    Running: 'bg-green-500',
    Stopped: 'bg-red-500',
    Error: 'bg-yellow-500',
  };

  const statusIcons = {
    Running: <Server className="h-5 w-5 text-green-500" />,
    Stopped: <AlertCircle className="h-5 w-5 text-red-500" />,
    Error: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  };

  const getNormalizedStatus = (status) => {
    const raw = status || '';
    const [statusLine] = raw.split('\n');
    const cleaned = statusLine.replace('!', '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  const normalizedStatus = getNormalizedStatus(service.status);

  const prepareChartData = (metric) => {
    const points = metric?.timeseries?.[0]?.data || [];
  
    const now = new Date();
    const last24Hrs = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  
    const filtered = points.filter(p => new Date(p.timeStamp) >= last24Hrs);
  
    return {
      labels: filtered.map(p => new Date(p.timeStamp).toLocaleTimeString()),
      datasets: [{
        label: metric.name?.localizedValue || metric.name?.value,
        data: filtered.map(p => p.average || p.sum || p.maximum || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  };
  

  return (
    <div
      className="card hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={() => setExpanded(prev => !prev)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {statusIcons[normalizedStatus]}
          <h3 className="font-bold text-lg">{service.name}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs text-white font-medium ${
          statusColors[normalizedStatus] || 'bg-gray-500'
        }`}>
          {service.status}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          <strong>URL:</strong>{' '}
          <a href={service.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {service.url || 'N/A'}
          </a>
        </p>

        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Last checked: {service.lastUpdated ? new Date(service.lastUpdated).toLocaleString() : 'Never'}
        </div>
      </div>

      {service.error && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {service.error}
          </p>
        </div>
      )}

      {/* Expanded Metrics */}
      {expanded && service.metrics?.length > 0 && (
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-semibold flex items-center text-gray-700">
            <BarChart className="h-4 w-4 mr-1" /> Metrics
          </h4>
          {service.metrics.map((metric, idx) => (
            <div key={idx} className="bg-white p-3 rounded shadow-sm border">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {metric.name?.localizedValue || metric.name?.value}
              </p>
              <Line data={prepareChartData(metric)} options={{ responsive: true, plugins: { legend: { display: false }}}} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusCard;
