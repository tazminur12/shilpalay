"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  Package,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Calendar,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/dashboard/stats?period=${period}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [period]);

  const formatCurrency = (amount) => {
    return `Tk ${amount.toFixed(2)}`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const getMaxRevenue = (data) => {
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map(d => d.revenue || 0), 100);
  };

  const renderBarChart = (data, maxValue, height = 200) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No data available
        </div>
      );
    }

    const barWidth = 100 / data.length;
    const maxBarHeight = height - 40;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.revenue / maxValue) * maxBarHeight : 0;
            const x = (index * barWidth) + (barWidth / 2) - 8;
            const y = height - barHeight - 20;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width="16"
                  height={barHeight}
                  fill="#000"
                  className="hover:fill-gray-600 transition-colors"
                  rx="2"
                />
                <text
                  x={x + 8}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-[10px] fill-gray-600"
                >
                  {item._id ? item._id.split('-')[2] || item._id.split('/')[1] : ''}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(maxValue)}</span>
        </div>
      </div>
    );
  };

  const renderLineChart = (data, maxValue, height = 200) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No data available
        </div>
      );
    }

    const width = 100;
    const pointWidth = width / (data.length - 1 || 1);
    const maxBarHeight = height - 40;
    
    const points = data.map((item, index) => {
      const x = index * pointWidth;
      const y = maxValue > 0 ? height - 20 - ((item.revenue / maxValue) * maxBarHeight) : height - 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke="#000"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          {data.map((item, index) => {
            const x = index * pointWidth;
            const y = maxValue > 0 ? height - 20 - ((item.revenue / maxValue) * maxBarHeight) : height - 20;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#000"
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(maxValue)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Failed to load dashboard data</div>
        </div>
      </div>
    );
  }

  const { overview, orderStatus, revenueByDay, topProducts, recentOrders, paymentMethods, monthlyRevenue } = stats;

  const statsCards = [
    { 
      name: 'Total Revenue', 
      value: formatCurrency(overview.totalRevenue), 
      icon: DollarSign, 
      change: `${overview.revenueChange >= 0 ? '+' : ''}${overview.revenueChange}%`, 
      isPositive: overview.revenueChange >= 0,
      color: 'bg-green-100 text-green-600' 
    },
    { 
      name: 'Total Orders', 
      value: formatNumber(overview.totalOrders), 
      icon: ShoppingBag, 
      change: `${overview.ordersChange >= 0 ? '+' : ''}${overview.ordersChange}%`, 
      isPositive: overview.ordersChange >= 0,
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      name: 'Total Customers', 
      value: formatNumber(overview.totalCustomers), 
      icon: Users, 
      change: '+0%', 
      isPositive: true,
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      name: 'Total Products', 
      value: formatNumber(overview.totalProducts), 
      icon: Package, 
      change: '+0%', 
      isPositive: true,
      color: 'bg-orange-100 text-orange-600' 
    },
  ];

  const maxDailyRevenue = getMaxRevenue(revenueByDay);
  const maxMonthlyRevenue = getMaxRevenue(monthlyRevenue);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full min-w-0">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 w-full min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  {stat.isPositive ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full min-w-0">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Analytics (Last {period} days)
            </h3>
          </div>
          <div className="h-64">
            {revenueByDay && revenueByDay.length > 0 ? (
              renderBarChart(revenueByDay, maxDailyRevenue, 240)
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Revenue Trend
            </h3>
          </div>
          <div className="h-64">
            {monthlyRevenue && monthlyRevenue.length > 0 ? (
              renderLineChart(monthlyRevenue, maxMonthlyRevenue, 240)
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No monthly data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full min-w-0">
        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(orderStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'delivered' ? 'bg-green-500' :
                    status === 'processing' ? 'bg-blue-500' :
                    status === 'pending' ? 'bg-yellow-500' :
                    status === 'shipped' ? 'bg-purple-500' :
                    status === 'cancelled' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(product.revenue || 0)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No product data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {method._id || 'Unknown'}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(method.revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500">{method.count} orders</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No payment data available</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
            <Link 
              href="/dashboard/orders"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/dashboard/orders/${order._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber || order._id.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer?.name || 'Guest'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total || 0)}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No recent orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
