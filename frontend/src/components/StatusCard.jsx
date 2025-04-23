import { Server, Clock, AlertCircle } from 'lucide-react';

const StatusCard = ({ service }) => {
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

  return (
    <div className="card hover:transform hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {statusIcons[service.status]}
          <h3 className="font-bold text-lg">{service.name}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs text-white font-medium ${
          statusColors[service.status] || 'bg-gray-500'
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
    </div>
  );
};

export default StatusCard;