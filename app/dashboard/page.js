"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    topCustomers: [],
    orders: [],
    products: []
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch customers
      const customersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/customers`,
        { credentials: "include" }
      );
      let customers = [];
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        console.log("Customers data:", customersData);
        customers = Array.isArray(customersData) ? customersData : [];
      } else {
        console.log("Customers API failed:", customersResponse.status);
      }

      // Fetch orders
      const ordersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/orders`,
        { credentials: "include" }
      );
      let orders = [];
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log("Orders data:", ordersData);
        // Orders API returns nested structure: { success: true, data: { orders: [...] } }
        if (ordersData.success && ordersData.data && ordersData.data.orders) {
          orders = Array.isArray(ordersData.data.orders) ? ordersData.data.orders : [];
        } else if (Array.isArray(ordersData)) {
          orders = ordersData;
        }
      } else {
        console.log("Orders API failed:", ordersResponse.status);
      }

      // Fetch products
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/products`,
        { credentials: "include" }
      );
      let products = [];
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log("Products data:", productsData);
        // Products API returns: { products: [...] }
        if (productsData.products) {
          products = Array.isArray(productsData.products) ? productsData.products : [];
        } else if (Array.isArray(productsData)) {
          products = productsData;
        }
      } else {
        console.log("Products API failed:", productsResponse.status);
      }

      // Calculate statistics
      const recentOrders = orders.slice(0, 5);
      const lowStockProducts = products.filter(product => product.stock < 10);
      
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.orderSummary?.total || 0);
      }, 0);
      
      // Get top customers by order count
      const customerOrderCounts = {};
      orders.forEach(order => {
        if (order.shippingAddress?.email) {
          const customerId = order.shippingAddress.email;
          customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
        }
      });
      
      const topCustomers = Object.entries(customerOrderCounts)
        .map(([email, count]) => {
          const customer = customers.find(c => c.email === email);
          return customer ? { ...customer, orderCount: count } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);

      setStats({
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        topCustomers,
        orders,
        products
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set default stats in case of error
      setStats({
        totalCustomers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        recentOrders: [],
        lowStockProducts: [],
        topCustomers: []
      });
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-300",
      confirmed: "bg-blue-500/20 text-blue-300",
      processing: "bg-purple-500/20 text-purple-300",
      shipped: "bg-indigo-500/20 text-indigo-300",
      delivered: "bg-green-500/20 text-green-300",
      cancelled: "bg-red-500/20 text-red-300"
    };
    return colors[status] || "bg-gray-500/20 text-gray-300";
  };

  // Generate chart data
  const generateRevenueChartData = () => {
    const last7Days = [];
    const revenueData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push(dateStr);
      
      // Calculate revenue for this day (simplified - in real app, you'd filter orders by date)
      const dayRevenue = stats.orders
        .filter(order => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);
      
      revenueData.push(dayRevenue);
    }
    
    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: revenueData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const generateOrdersChartData = () => {
    const last7Days = [];
    const ordersData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push(dateStr);
      
      const dayOrders = stats.orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return orderDate.toDateString() === date.toDateString();
      }).length;
      
      ordersData.push(dayOrders);
    }
    
    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Orders',
          data: ordersData,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
      ],
    };
  };

  const generateCategoryChartData = () => {
    const categoryCount = {};
    stats.products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    
    const categories = Object.keys(categoryCount);
    const counts = Object.values(categoryCount);
    
    const colors = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(236, 72, 153, 0.8)',
    ];
    
    return {
      labels: categories,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  const generateOrderStatusChartData = () => {
    const statusCount = {};
    stats.orders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    
    const statuses = Object.keys(statusCount);
    const counts = Object.values(statusCount);
    
    const statusColors = {
      pending: 'rgba(245, 158, 11, 0.8)',
      confirmed: 'rgba(59, 130, 246, 0.8)',
      processing: 'rgba(168, 85, 247, 0.8)',
      shipped: 'rgba(99, 102, 241, 0.8)',
      delivered: 'rgba(34, 197, 94, 0.8)',
      cancelled: 'rgba(239, 68, 68, 0.8)',
    };
    
    const colors = statuses.map(status => statusColors[status] || 'rgba(107, 114, 128, 0.8)');
    
    return {
      labels: statuses.map(status => status.charAt(0).toUpperCase() + status.slice(1)),
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  const generateTopProductsChartData = () => {
    // Get top 5 products by stock (or you could use sales data if available)
    const topProducts = stats.products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);
    
    const productNames = topProducts.map(product => 
      product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name
    );
    const stockData = topProducts.map(product => product.stock);
    
    return {
      labels: productNames,
      datasets: [
        {
          label: 'Stock Quantity',
          data: stockData,
          backgroundColor: [
            'rgba(239, 68, 68, 0.6)',
            'rgba(34, 197, 94, 0.6)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(168, 85, 247, 0.6)',
            'rgba(245, 158, 11, 0.6)',
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const generateMonthlyRevenueData = () => {
    const last6Months = [];
    const revenueData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      last6Months.push(monthStr);
      
      // Calculate revenue for this month (simplified)
      const monthRevenue = stats.orders
        .filter(order => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);
      
      revenueData.push(monthRevenue);
    }
    
    return {
      labels: last6Months,
      datasets: [
        {
          label: 'Monthly Revenue (₹)',
          data: revenueData,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#d1d5db',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <p className="text-white font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
        Dashboard Overview
      </h1>
        <p className="text-gray-200 font-medium mb-1">{getGreeting()}, Admin.</p>
        <p className="text-gray-300">
          Welcome to your admin dashboard. Here's what's happening with your store.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Customers */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalCustomers}</p>
              <p className="text-gray-400 text-xs mt-1">Registered users</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalOrders}</p>
              <p className="text-gray-400 text-xs mt-1">All time orders</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalProducts}</p>
              <p className="text-gray-400 text-xs mt-1">In inventory</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-1">All time sales</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <div className="text-sm text-gray-400">Last 7 days</div>
          </div>
          <div className="h-64">
            <Line data={generateRevenueChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Orders Trend</h3>
            <div className="text-sm text-gray-400">Last 7 days</div>
          </div>
          <div className="h-64">
            <Bar data={generateOrdersChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Status Pie Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Order Status</h3>
            <div className="text-sm text-gray-400">Distribution</div>
          </div>
          <div className="h-64">
            <Pie data={generateOrderStatusChartData()} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#d1d5db',
                    padding: 15,
                  },
                },
              },
            }} />
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Products</h3>
            <div className="text-sm text-gray-400">By Stock</div>
          </div>
          <div className="h-64">
            <Bar data={generateTopProductsChartData()} options={{
              ...chartOptions,
              indexAxis: 'y',
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  display: false,
                },
              },
            }} />
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
            <div className="text-sm text-gray-400">Last 6 months</div>
          </div>
          <div className="h-64">
            <Line data={generateMonthlyRevenueData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Product Categories Chart */}
      <div className="mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Product Categories</h3>
            <div className="text-sm text-gray-400">Distribution by category</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <Doughnut data={generateCategoryChartData()} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#d1d5db',
                      padding: 20,
                    },
                  },
                },
              }} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-3">
                {Object.entries(
                  stats.products.reduce((acc, product) => {
                    acc[product.category] = (acc[product.category] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([category, count], index) => {
                  const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                        <span className="text-gray-300 text-sm">{category}</span>
                      </div>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Round Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Customer vs Orders Doughnut Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Business Overview</h3>
            <div className="text-sm text-gray-400">Key Metrics</div>
          </div>
          <div className="h-64">
            <Doughnut data={{
              labels: ['Total Customers', 'Total Orders', 'Total Products'],
              datasets: [
                {
                  data: [stats.totalCustomers, stats.totalOrders, stats.totalProducts],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(168, 85, 247, 1)',
                  ],
                  borderWidth: 2,
                },
              ],
            }} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#d1d5db',
                    padding: 20,
                  },
                },
              },
            }} />
          </div>
        </div>

        {/* Revenue vs Orders Comparison */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
            <div className="text-sm text-gray-400">Revenue vs Orders</div>
          </div>
          <div className="h-64">
            <Doughnut data={{
              labels: ['Total Revenue', 'Average Order Value'],
              datasets: [
                {
                  data: [
                    stats.totalRevenue,
                    stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0
                  ],
                  backgroundColor: [
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                  ],
                  borderColor: [
                    'rgba(245, 158, 11, 1)',
                    'rgba(236, 72, 153, 1)',
                  ],
                  borderWidth: 2,
                },
              ],
            }} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#d1d5db',
                    padding: 20,
                    generateLabels: function(chart) {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                          const value = data.datasets[0].data[i];
                          const formattedValue = i === 0 ? `₹${value.toLocaleString()}` : `₹${value}`;
                          return {
                            text: `${label}: ${formattedValue}`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            strokeStyle: data.datasets[0].borderColor[i],
                            lineWidth: data.datasets[0].borderWidth,
                            hidden: false,
                            index: i
                          };
                        });
                      }
                      return [];
                    }
                  },
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {order.shippingAddress.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{order.shippingAddress.name}</p>
                      <p className="text-xs text-gray-400">#{order.orderId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">₹{order.orderSummary?.total?.toLocaleString() || 0}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Low Stock Alert</h3>
            <button
              onClick={() => router.push("/dashboard/view-products")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              Manage Inventory
            </button>
          </div>
          <div className="space-y-4">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-600"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-200">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-300">{product.stock} left</p>
                    <p className="text-xs text-gray-400">Low stock</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">All products well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {stats.topCustomers.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Customers</h3>
            <button
              onClick={() => router.push("/dashboard/customers")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              View All Customers
            </button>
          </div>
          <div className="space-y-4">
            {stats.topCustomers.map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">#{index + 1}</span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{customer.name}</p>
                    <p className="text-xs text-gray-400">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{customer.orderCount} orders</p>
                  <p className="text-xs text-gray-400">Loyal customer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
