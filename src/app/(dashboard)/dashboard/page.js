import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp 
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Total Revenue', value: '৳ 54,230', icon: DollarSign, change: '+12%', color: 'bg-green-100 text-green-600' },
    { name: 'Total Orders', value: '1,245', icon: ShoppingBag, change: '+5%', color: 'bg-blue-100 text-blue-600' },
    { name: 'Total Customers', value: '890', icon: Users, change: '+18%', color: 'bg-purple-100 text-purple-600' },
    { name: 'Growth', value: '24%', icon: TrendingUp, change: '+2%', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full min-w-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 w-full min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Analytics</h3>
          <div className="flex items-center justify-center h-full text-gray-400">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
          <div className="flex items-center justify-center h-full text-gray-400">
            Table Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
