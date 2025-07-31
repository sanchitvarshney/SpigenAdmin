import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { fetchDashboardData } from "@/features/dashboard/dashboardSlice";
import DashboardSkeleton from "@/components/reusable/DashboardSkeleton";
import {
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiFileText,
  FiTruck,
  FiBarChart2,
  FiActivity,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchDashboardData())}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Get current date and prepare month data
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Create array of last 3 months including current month
  const getLastThreeMonths = () => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString("default", { month: "short" }));
    }
    return months;
  };

  const lastThreeMonths = getLastThreeMonths();

  // Filter data for current month and last 2 months
  const filteredMonthData = lastThreeMonths.map((monthName) => {
    const foundData = data.monthWiseData.find(
      (item) => item.month === monthName
    );
    return (
      foundData || {
        month: monthName,
        soCount: 0,
        ewayCount: 0,
        einvoiceCount: 0,
      }
    );
  });

  // Prepare chart data
  const chartData = data.monthWiseData.map((item) => ({
    month: item.month,
    "Sales Orders": item.soCount,
    "E-Waybills": item.ewayCount,
    "E-Invoices": item.einvoiceCount,
  }));

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome to your business analytics overview
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <FiTrendingUp className="inline mr-1" />
                {data.percentageIncreaseInSO}% increase
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Sales Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Sales Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.totalSalesOrderCount.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <FiTrendingUp className="mr-1" />
                  {data.percentageIncreaseInSO}% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Clients Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Clients
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.totalClientsCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Active customers</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.totalProductsCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">In catalog</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiPackage className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Channels Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Sales Channels
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.totalChannelsCount}
                </p>
                <p className="text-sm text-gray-500 mt-1">Active channels</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FiBarChart2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* E-Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* E-Invoices Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                E-Invoices
              </h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FiFileText className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {data.totalEinvoiceCount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total e-invoices generated</p>
          </div>

          {/* E-Waybills Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                E-Waybills
              </h3>
              <div className="bg-teal-100 p-2 rounded-lg">
                <FiTruck className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {data.totalEwaybillCount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total e-waybills generated</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Sales Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Sales Orders
              </h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FiActivity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Sales Orders"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* E-Documents Comparison Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                E-Documents Overview
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FiBarChart2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="E-Invoices"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="E-Waybills"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Activity Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMonthData.map((month, index) => (
              <div key={month.month} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {month.month}
                  {index === 2 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Sales Orders:</span>{" "}
                    {month.soCount}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">E-Invoices:</span>{" "}
                    {month.einvoiceCount}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">E-Waybills:</span>{" "}
                    {month.ewayCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
