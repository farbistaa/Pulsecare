import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';

interface BloodGroupChartProps {
  data: Record<string, number>;
}

export function BloodGroupChart({ data }: BloodGroupChartProps) {
  const chartData = Object.entries(data).map(([bloodGroup, count]) => ({
    name: bloodGroup,
    value: count,
  }));

  const COLORS = [
    '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
    '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface MonthlyDonationsChartProps {
  data: Array<{ month: string; count: number }>;
}

export function MonthlyDonationsChart({ data }: MonthlyDonationsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#DC2626" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonationTrendChartProps {
  data: Array<{ month: string; donations: number }>;
}

export function DonationTrendChart({ data }: DonationTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="donations" 
          stroke="#DC2626" 
          strokeWidth={2}
          dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
