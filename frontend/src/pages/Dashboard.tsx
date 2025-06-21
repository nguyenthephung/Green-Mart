import React, { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const dataWeekly = [
  { name: 'Mon', sales: 1200 },
  { name: 'Tue', sales: 2100 },
  { name: 'Wed', sales: 800 },
  { name: 'Thu', sales: 1600 },
  { name: 'Fri', sales: 900 },
  { name: 'Sat', sales: 1800 },
  { name: 'Sun', sales: 1000 },
]

const dataMonthly = [
  { name: 'Week 1', sales: 5000 },
  { name: 'Week 2', sales: 7200 },
  { name: 'Week 3', sales: 6100 },
  { name: 'Week 4', sales: 8000 },
]

const dataYearly = [
  { name: 'Jan', sales: 32000 },
  { name: 'Feb', sales: 28000 },
  { name: 'Mar', sales: 40000 },
  { name: 'Apr', sales: 35000 },
  { name: 'May', sales: 39000 },
  { name: 'Jun', sales: 41000 },
]

const chartData = {
  weekly: dataWeekly,
  monthly: dataMonthly,
  yearly: dataYearly,
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 border-r">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xl font-bold text-green-700">GREEN MART</span>
        </div>
        <nav className="space-y-3 text-sm font-medium">
          <a href="#" className="block py-2 px-3 bg-blue-900 text-white rounded">📊 Dashboard</a>
          <a href="#" className="block py-2 px-3 hover:bg-gray-100 rounded">📦 All Products</a>
          <a href="#" className="block py-2 px-3 hover:bg-gray-100 rounded">📝 Order List</a>
        </nav>
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase mb-2">
            <span>Categories</span>
            <span className="text-gray-500">▼</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Home &gt; Dashboard</p>
          </div>
          <div className="text-sm text-gray-500">Oct 11, 2023 - Nov 11, 2023</div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Total Orders', 'Active Orders', 'Completed Orders', 'Return Orders'].map((title, index) => (
            <div key={index} className="border rounded-lg p-4 shadow bg-white">
              <p className="text-sm text-gray-600">{title}</p>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-1">
                <span className="text-lg">🛒</span>
                ₹126,500
              </h2>
              <p className="text-sm text-green-500 mt-1">↑ 34.7% vs last month</p>
            </div>
          ))}
        </div>

        {/* Sales Graph + Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales Graph */}
          <div className="lg:col-span-2 border rounded-lg p-4 shadow bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Sales Graph</h2>
              <div className="flex gap-2">
                {(['weekly', 'monthly', 'yearly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm px-3 py-1 border rounded ${
                      activeTab === tab
                        ? 'bg-gray-200 text-gray-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData[activeTab]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="border rounded-lg p-4 shadow bg-white">
            <h2 className="font-semibold text-gray-800 mb-4">Best Sellers</h2>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    PR
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Lorem Ipsum</p>
                    <p className="text-xs text-gray-500">999 sales</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₹126,500</p>
              </div>
            ))}
            <button className="w-full text-sm py-2 rounded text-white bg-blue-500 hover:bg-blue-600 mt-2">
              Report
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="border rounded-lg shadow bg-white p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-2"></th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: '#25426', date: 'Nov 8, 2023', name: 'Kevin', status: 'Delivered', amount: '₹200.00' },
                  { id: '#25425', date: 'Nov 7, 2023', name: 'Kamal', status: 'Canceled', amount: '₹200.00' },
                  { id: '#25424', date: 'Nov 6, 2023', name: 'Nikhil', status: 'Delivered', amount: '₹200.00' },
                  { id: '#25423', date: 'Nov 5, 2023', name: 'Shivam', status: 'Delivered', amount: '₹200.00' },
                ].map((order, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2"><input type="checkbox" /></td>
                    <td className="p-2">Lorem Ipsum</td>
                    <td className="p-2">{order.id}</td>
                    <td className="p-2">{order.date}</td>
                    <td className="p-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                        {order.name[0]}
                      </div>
                      {order.name}
                    </td>
                    <td className="p-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-2 text-right">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
