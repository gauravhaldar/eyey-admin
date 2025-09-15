"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Download,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [stats, setStats] = useState([]);

  // Fetch orders
  const fetchOrders = async (page = 1, search = "", status = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseURL}/api/admin/orders?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Show user-friendly error message
      alert(`Failed to fetch orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdateStatusLoading(true);
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${baseURL}/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh orders
        fetchOrders(currentPage, searchTerm, statusFilter);
        setSelectedOrder(data.data);
        alert("Order status updated successfully!");
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseURL}/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders(currentPage, searchTerm, statusFilter);
        alert("Order deleted successfully!");
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  // Download invoice
  const downloadInvoice = async (orderId) => {
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${baseURL}/api/admin/orders/${orderId}/invoice`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate invoice: ${response.status}`);
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "invoice.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert(`Failed to download invoice: ${error.message}`);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500/20 text-yellow-300", icon: Clock },
      confirmed: { color: "bg-blue-500/20 text-blue-300", icon: CheckCircle },
      processing: { color: "bg-orange-500/20 text-orange-300", icon: Package },
      shipped: { color: "bg-purple-500/20 text-purple-300", icon: Truck },
      delivered: { color: "bg-green-500/20 text-green-300", icon: CheckCircle },
      cancelled: { color: "bg-red-500/20 text-red-300", icon: X },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Order details modal
  const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">
                Order #{order.orderId}
              </h2>
              <p className="text-sm text-gray-300">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadInvoice(order._id)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                title="Download Invoice"
              >
                <FileText className="w-4 h-4" />
                Download Invoice
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-all duration-300 p-1 rounded hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Order Status
                </h3>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <select
                  value={order.status}
                  onChange={(e) =>
                    onUpdateStatus(order.orderId, e.target.value)
                  }
                  disabled={updateStatusLoading}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                >
                  <option value="pending" className="bg-gray-800">Pending</option>
                  <option value="confirmed" className="bg-gray-800">Confirmed</option>
                  <option value="processing" className="bg-gray-800">Processing</option>
                  <option value="shipped" className="bg-gray-800">Shipped</option>
                  <option value="delivered" className="bg-gray-800">Delivered</option>
                  <option value="cancelled" className="bg-gray-800">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">Name:</span>{" "}
                    {order.shippingAddress.name}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">Email:</span>{" "}
                    {order.shippingAddress.email}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">Phone:</span>{" "}
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
                  <p className="text-sm text-gray-200">
                    {order.shippingAddress.addressLine1}
                  </p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-sm text-gray-200">
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-sm text-gray-200">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Items ({order.items.length})
              </h3>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border border-white/20"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-300">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " • "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          ₹{item.price} × {item.quantity}
                        </p>
                        <p className="text-xs text-gray-300">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Order Summary
              </h3>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Subtotal:</span>
                  <span className="text-white">₹{order.orderSummary.subtotal.toLocaleString()}</span>
                </div>
                {order.orderSummary.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-300">
                    <span>Coupon Discount:</span>
                    <span>
                      -₹{order.orderSummary.couponDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Tax:</span>
                  <span className="text-white">₹{order.orderSummary.tax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Shipping:</span>
                  <span className="text-white">₹{order.orderSummary.shippingCharge}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                  <span className="text-white">Total:</span>
                  <span className="text-white">₹{order.orderSummary.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Payment Method:</span>
                  <span className="capitalize text-white">
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
          Order Management
        </h1>
        <p className="text-gray-300">Manage and track all customer orders</p>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat._id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                    {stat._id}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {stat.count}
                  </p>
                </div>
                <StatusBadge status={stat._id} />
              </div>
              <p className="text-xs text-gray-300 mt-1">
                ₹{stat.totalValue.toLocaleString()} total
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
            >
              <option value="all" className="bg-gray-800">All Orders</option>
              <option value="pending" className="bg-gray-800">Pending</option>
              <option value="confirmed" className="bg-gray-800">Confirmed</option>
              <option value="processing" className="bg-gray-800">Processing</option>
              <option value="shipped" className="bg-gray-800">Shipped</option>
              <option value="delivered" className="bg-gray-800">Delivered</option>
              <option value="cancelled" className="bg-gray-800">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-white/10">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-white/10">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-white/10">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-white/10">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-white/10">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider border-b border-white/10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="ml-2 text-white">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          #{order.orderId}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.items.length} items
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {order.shippingAddress.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.shippingAddress.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-200">
                        ₹{order.orderSummary.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {order.paymentMethod.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-200">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-all duration-300 p-1 rounded hover:bg-blue-500/20"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadInvoice(order._id)}
                          className="text-green-400 hover:text-green-300 transition-all duration-300 p-1 rounded hover:bg-green-500/20"
                          title="Download Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.orderId)}
                          className="text-red-400 hover:text-red-300 transition-all duration-300 p-1 rounded hover:bg-red-500/20"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/5 px-4 py-3 border-t border-white/10 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-white/20 rounded-lg text-sm text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-white/20 rounded-lg text-sm text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            onUpdateStatus={updateOrderStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
