import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Revenu({ range, setRange, data, isError, isLoading }) {
  const [localLoading, setLocalLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const handleRangeChange = (e) => {
    setLocalLoading(true); // show loader immediately
    setRange(e.target.value);
  };

  // Update chartData whenever data changes
  useEffect(() => {
    if (data?.data?.chartData) {
      setChartData(data.data.chartData); // update chart
      setLocalLoading(false); // hide loader
    }
  }, [data]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);

  if (isError) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">Failed to load revenue data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total : {isLoading || localLoading ? '...' : formatCurrency(data?.data?.Revenue || 0)}
          </p>
        </div>
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={range}
          onChange={handleRangeChange}
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
      </div>

      {/* Chart / Loading */}
      {(isLoading || localLoading) ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              tickFormatter={(value) =>
                `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
              }
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={3}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
