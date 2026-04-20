import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Star, TrendingUp, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

const incidentData = [
  { time: '6 AM', incidents: 2 },
  { time: '9 AM', incidents: 5 },
  { time: '12 PM', incidents: 3 },
  { time: '3 PM', incidents: 7 },
  { time: '6 PM', incidents: 12 },
  { time: '9 PM', incidents: 18 },
  { time: '12 AM', incidents: 25 },
];

const ratingData = [
  { name: 'Bus', rating: 4.2 },
  { name: 'Subway', rating: 3.8 },
  { name: 'Train', rating: 4.5 },
  { name: 'Tram', rating: 3.9 },
];

const issueTypeData = [
  { name: 'Poor Lighting', value: 400 },
  { name: 'Harassment', value: 300 },
  { name: 'Unsafe Crowd', value: 300 },
  { name: 'Theft', value: 200 },
];
const COLORS = ['#f472b6', '#ec4899', '#db2777', '#9d174d'];

export default function Analytics() {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] p-6 md:p-8 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time public transport safety metrics based on user feedback.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-700">System Live</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Reports"
            value="12,450"
            trend="+12% this week"
            icon={<AlertTriangle className="w-6 h-6 text-brand-500" />}
          />
          <MetricCard 
            title="Average Safety Score"
            value="4.1/5"
            trend="+0.2 this month"
            icon={<Star className="w-6 h-6 text-amber-400" />}
          />
          <MetricCard 
            title="Safe Routes Found"
            value="142"
            trend="Today"
            icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
          />
          <MetricCard 
            title="Active Navigations"
            value="3,205"
            trend="Live"
            icon={<MapPin className="w-6 h-6 text-blue-500" />}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidents by Time */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[350px]">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Incidents Over Time (24h)</h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="incidents" stroke="#db2777" strokeWidth={3} dot={{ fill: '#db2777', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-500 text-center mt-2 items-center justify-center flex gap-1"><TrendingUp className="w-4 h-4"/> Peak incidents occur during late-night hours.</p>
          </div>

          {/* User-based safety ratings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[350px]">
             <h3 className="text-lg font-bold text-slate-800 mb-4">User-Based Safety Ratings</h3>
             <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="rating" fill="#f472b6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
             <p className="text-sm text-slate-500 text-center mt-2">Aggregated from user feedback ratings.</p>
          </div>
        </div>

        {/* Route-wise insights & Issue Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[350px]">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Reported Issues</h3>
             <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {issueTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
           </div>

           <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Route-Wise Safety Insights</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 font-semibold">Route Level / Transport</th>
                    <th className="pb-3 font-semibold">Safety Score</th>
                    <th className="pb-3 font-semibold">Active Incidents</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-800">Downtown Express (Subway)</td>
                    <td className="py-4"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/> 4.5</div></td>
                    <td className="py-4 text-slate-500">2 (Minor)</td>
                    <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Safe</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-800">Route 14 Bus (Night)</td>
                    <td className="py-4"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/> 2.1</div></td>
                    <td className="py-4 text-slate-500">15 (Severe)</td>
                    <td className="py-4"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">High Risk</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-800">Central Train Line</td>
                    <td className="py-4"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/> 3.8</div></td>
                    <td className="py-4 text-slate-500">5 (Moderate)</td>
                    <td className="py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">Caution</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <p className="text-xs font-medium text-brand-500 mt-1">{trend}</p>
      </div>
    </div>
  );
}