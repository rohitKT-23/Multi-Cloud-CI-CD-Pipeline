import { useState } from 'react';
import { Server, Clock, AlertCircle, BarChart, ChevronDown, Activity, MemoryStick as Memory, Network, DollarSign } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
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

  const metricIcons = {
    CPU: <Activity className="h-4 w-4" />,
    Memory: <Memory className="h-4 w-4" />,
    Network: <Network className="h-4 w-4" />,
    Default: <BarChart className="h-4 w-4" />
  };

  const getMetricIcon = (metricName) => {
    const name = metricName.toLowerCase();
    if (name.includes('cpu')) return metricIcons.CPU;
    if (name.includes('memory')) return metricIcons.Memory;
    if (name.includes('network')) return metricIcons.Network;
    return metricIcons.Default;
  };

  const getNormalizedStatus = (status) => {
    const raw = status || '';
    const [statusLine] = raw.split('\n');
    const cleaned = statusLine.replace('!', '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  const normalizedStatus = getNormalizedStatus(service.status);

  const formatValue = (value, metricName) => {
    const name = metricName.toLowerCase();
    if (name.includes('cpu')) return `${value.toFixed(1)}%`;
    if (name.includes('memory')) return `${(value / 1024).toFixed(2)} GB`;
    if (name.includes('network')) return `${(value / 1024 / 1024).toFixed(2)} MB/s`;
    return value.toFixed(2);
  };

  const prepareChartData = (metric) => {
    // AWS format
    if (metric?.Timestamps && metric?.Values) {
      const sorted = metric.Timestamps.map((time, idx) => ({
        time,
        value: metric.Values[idx]
      })).sort((a, b) => new Date(a.time) - new Date(b.time));
  
      return {
        labels: sorted.map(p => new Date(p.time).toLocaleTimeString()),
        datasets: [{
          label: metric.Label || metric.Id,
          data: sorted.map(p => p.value),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
        }]
      };
    }
  
    // Azure format
    const points = metric?.timeseries?.[0]?.data || [];
    const now = new Date();
    const last24Hrs = new Date(now.getTime() - 24 * 60 * 60 * 1000);
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

  const getMetricName = (metric) => {
    return metric.name?.value || metric.Label || metric.Id || 'Unknown Metric';
  };

  const costTrend = service.cost?.current > service.cost?.previous ? 'up' : 'down';
  const costDiff = Math.abs(service.cost?.current - service.cost?.previous).toFixed(2);
  const costPercentChange = ((service.cost?.current - service.cost?.previous) / service.cost?.previous * 100).toFixed(1);

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <motion.div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50"
            >
              {statusIcons[normalizedStatus]}
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs text-white font-medium ${
                  statusColors[normalizedStatus] || 'bg-gray-500'
                }`}>
                  {service.status}
                </span>
                {service.url && service.url !== 'N/A' && (
                  <a
                    href={service.url}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Service →
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {service.cost && (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-gray-900">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold">{service.cost.current.toFixed(2)}</span>
                </div>
                <div className={`text-xs ${
                  costTrend === 'up' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {costTrend === 'up' ? '↑' : '↓'} ${costDiff} ({costPercentChange}%)
                </div>
              </div>
            )}
            <div className="text-right text-sm text-gray-500">
              <Clock className="h-4 w-4 inline mr-1" />
              {service.lastUpdated ? new Date(service.lastUpdated).toLocaleString() : 'Never'}
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Quick Metrics Preview */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {service.metrics.slice(0, 3).map((metric, idx) => {
            const metricName = getMetricName(metric);
            const value = metric.Values?.[metric.Values.length - 1] || 
                         metric.timeseries?.[0]?.data?.[metric.timeseries[0].data.length - 1]?.average || 0;
            
            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600">
                  {getMetricIcon(metricName)}
                  <span className="text-sm font-medium">{metricName}</span>
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {formatValue(value, metricName)}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-6">
              {service.error ? (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start"
                >
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{service.error}</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {service.cost && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Cost Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Current Month</div>
                          <div className="text-xl font-bold text-gray-900">${service.cost.current.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Previous Month</div>
                          <div className="text-xl font-bold text-gray-900">${service.cost.previous.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Forecast</div>
                          <div className="text-xl font-bold text-gray-900">${service.cost.forecast.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {service.metrics?.length > 0 && (
                    <>
                      <div className="flex items-center">
                        <BarChart className="h-5 w-5 text-gray-500 mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">Detailed Metrics</h4>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {service.metrics.map((metric, idx) => {
                          const metricName = getMetricName(metric);
                          return (
                            <motion.div
                              key={idx}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-2 mb-4">
                                {getMetricIcon(metricName)}
                                <h5 className="text-sm font-medium text-gray-700">
                                  {metricName}
                                </h5>
                              </div>
                              <div className="h-[200px]">
                                <Line
                                  data={prepareChartData(metric)}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        padding: 12,
                                        titleFont: { size: 13 },
                                        bodyFont: { size: 12 },
                                        callbacks: {
                                          label: (context) => {
                                            const value = context.raw;
                                            return formatValue(value, metricName);
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.05)' },
                                        ticks: {
                                          callback: (value) => formatValue(value, metricName)
                                        }
                                      },
                                      x: {
                                        grid: { display: false }
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StatusCard;