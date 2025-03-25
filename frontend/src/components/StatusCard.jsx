const StatusCard = ({ service }) => {
    const statusColors = {
      Running: 'bg-green-500',
      Stopped: 'bg-red-500',
      Error: 'bg-yellow-500',
    };
  
    return (
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">{service.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${
            statusColors[service.status] || 'bg-gray-500'
          }`}>
            {service.status}
          </span>
        </div>
        <p className="mt-2 text-sm">
          <strong>URL:</strong> {service.url || 'N/A'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Last checked: {service.lastUpdated ? new Date(service.lastUpdated).toLocaleString() : 'Never'}
        </p>
        {service.error && (
          <p className="text-xs text-red-500 mt-2">Error: {service.error}</p>
        )}
      </div>
    );
  };
  // Add this line at the end:
  export default StatusCard;