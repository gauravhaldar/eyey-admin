"use client";
import { useState, useEffect } from "react";

export default function Coupons() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    amount: "",
    minValue: "",
    maxValue: "",
    usageLimit: "",
    startDate: "",
    expiryDate: "",
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/admin/coupons",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        console.log("Fetched coupons:", data.data);
        setCoupons(data.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new coupon
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      // Convert string values to numbers before sending
      const couponData = {
        ...formData,
        amount: Number(formData.amount),
        minValue: Number(formData.minValue),
        maxValue: Number(formData.maxValue),
        usageLimit: Number(formData.usageLimit),
        startDate: formData.startDate && formData.startDate.trim() !== "" ? formData.startDate : null,
        expiryDate: formData.expiryDate && formData.expiryDate.trim() !== "" ? formData.expiryDate : null,
      };


      const response = await fetch(
        "http://localhost:8000/api/admin/coupons",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(couponData), // Use couponData instead of formData
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          name: "",
          code: "",
          type: "percentage",
          amount: "",
          minValue: "",
          maxValue: "",
          usageLimit: "",
          startDate: "",
          expiryDate: "",
        });
        fetchCoupons();
        alert("Coupon created successfully!");
      } else {
        alert(data.message || "Error creating coupon");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Error creating coupon");
    }
  };

  // Edit coupon
  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      // Convert string values to numbers before sending
      const couponData = {
        ...formData,
        amount: Number(formData.amount),
        minValue: Number(formData.minValue),
        maxValue: Number(formData.maxValue),
        usageLimit: Number(formData.usageLimit),
        startDate: formData.startDate && formData.startDate.trim() !== "" ? formData.startDate : null,
        expiryDate: formData.expiryDate && formData.expiryDate.trim() !== "" ? formData.expiryDate : null,
      };

      console.log("Updating coupon data:", couponData);

      const response = await fetch(
        `http://localhost:8000/api/admin/coupons/${editingCoupon._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(couponData), // Use couponData instead of formData
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingCoupon(null);
        setFormData({
          name: "",
          code: "",
          type: "percentage",
          amount: "",
          minValue: "",
          maxValue: "",
          usageLimit: "",
          startDate: "",
          expiryDate: "",
        });
        fetchCoupons();
        alert("Coupon updated successfully!");
      } else {
        alert(data.message || "Error updating coupon");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      alert("Error updating coupon");
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (id) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/admin/coupons/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data.success) {
          fetchCoupons();
          alert("Coupon deleted successfully!");
        } else {
          alert(data.message || "Error deleting coupon");
        }
      } catch (error) {
        console.error("Error deleting coupon:", error);
        alert("Error deleting coupon");
      }
    }
  };

  // Open edit modal
  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount.toString(),
      minValue: coupon.minValue.toString(),
      maxValue: coupon.maxValue.toString(),
      usageLimit: coupon.usageLimit.toString(),
      startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  // Check if coupon is scheduled (not yet started)
  const isScheduled = (coupon) => {
    return coupon.startDate && coupon.startDate !== "" && new Date(coupon.startDate) > new Date();
  };

  // Check if coupon is expired
  const isExpired = (coupon) => {
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
      return true;
    if (coupon.usedCount >= coupon.usageLimit) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white mb-4">
            Coupons Management
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Create and manage discount coupons
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:px-6 sm:py-2 rounded-lg transition-colors font-medium"
        >
          + Add New Coupon
        </button>
      </div>

      {/* Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 text-center border border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">
            Total Coupons
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">
            {coupons.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 text-center border border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">
            Active Coupons
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">
            {
              coupons.filter((coupon) => coupon.isActive && !isExpired(coupon) && !isScheduled(coupon))
                .length
            }
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 text-center border border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">
            Scheduled Coupons
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
            {coupons.filter((coupon) => isScheduled(coupon)).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 text-center border border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">
            Expired Coupons
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-red-400">
            {coupons.filter((coupon) => isExpired(coupon)).length}
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
        <div className="bg-gray-700 px-6 py-3 border-b border-gray-600">
          <div className="grid grid-cols-10 gap-4">
            <div className="font-semibold text-gray-300">Name</div>
            <div className="font-semibold text-gray-300">Code</div>
            <div className="font-semibold text-gray-300">Type</div>
            <div className="font-semibold text-gray-300">Amount</div>
            <div className="font-semibold text-gray-300">Min Value</div>
            <div className="font-semibold text-gray-300">Usage</div>
            <div className="font-semibold text-gray-300">Status</div>
            <div className="font-semibold text-gray-300">Start Date</div>
            <div className="font-semibold text-gray-300">Expiry</div>
            <div className="font-semibold text-gray-300">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-600">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="px-6 py-4 hover:bg-gray-700 transition-colors"
            >
              <div className="grid grid-cols-10 gap-4 items-center">
                <div className="text-white font-medium">{coupon.name}</div>
                <div className="text-gray-300 font-mono bg-gray-600 px-2 py-1 rounded text-sm">
                  {coupon.code}
                </div>
                <div className="text-gray-300 capitalize">{coupon.type}</div>
                <div className="text-gray-300">
                  {coupon.type === "percentage"
                    ? `${coupon.amount}%`
                    : `₹${coupon.amount}`}
                </div>
                <div className="text-gray-300">₹{coupon.minValue}</div>
                <div className="text-gray-300">
                  {coupon.usedCount}/{coupon.usageLimit}
                </div>
                <div>
                  {isScheduled(coupon) ? (
                    <span className="bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded-full">
                      Scheduled
                    </span>
                  ) : isExpired(coupon) ? (
                    <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-full">
                      Expired
                    </span>
                  ) : coupon.isActive ? (
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-gray-300 text-sm">
                  {coupon.startDate && coupon.startDate !== ""
                    ? new Date(coupon.startDate).toLocaleDateString()
                    : "Immediate"}
                </div>
                <div className="text-gray-300 text-sm">
                  {coupon.expiryDate
                    ? new Date(coupon.expiryDate).toLocaleDateString()
                    : "No expiry"}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(coupon)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile & Tablet Card View - Improved */}
      <div className="xl:hidden space-y-3">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 border border-gray-700"
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                  {coupon.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-mono bg-gray-600 px-2 py-1 rounded text-xs sm:text-sm">
                    {coupon.code}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {coupon.type}
                  </span>
                </div>
              </div>
              <div className="flex justify-between sm:justify-end items-center">
                <div className="sm:hidden text-lg font-bold text-white">
                  {coupon.type === "percentage"
                    ? `${coupon.amount}%`
                    : `₹${coupon.amount}`}
                </div>
                <div>
                  {isScheduled(coupon) ? (
                    <span className="bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded-full">
                      Scheduled
                    </span>
                  ) : isExpired(coupon) ? (
                    <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-full">
                      Expired
                    </span>
                  ) : coupon.isActive ? (
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
              <div className="hidden sm:block">
                <span className="text-gray-400 font-medium">Amount:</span>
                <div className="font-semibold text-white">
                  {coupon.type === "percentage"
                    ? `${coupon.amount}%`
                    : `₹${coupon.amount}`}
                </div>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Min Order:</span>
                <div className="font-semibold text-white">
                  ₹{coupon.minValue}
                </div>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Max Order:</span>
                <div className="font-semibold text-white">
                  ₹{coupon.maxValue}
                </div>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Usage:</span>
                <div className="font-semibold text-white">
                  {coupon.usedCount}/{coupon.usageLimit}
                </div>
              </div>
            </div>

            {/* Progress Bar for Usage */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Usage Progress</span>
                <span>
                  {Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-gray-600 space-y-2 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                <div>
                  Starts:{" "}
                  {coupon.startDate && coupon.startDate !== ""
                    ? new Date(coupon.startDate).toLocaleDateString()
                    : "Immediate"}
                </div>
                <div>
                  Expires:{" "}
                  {coupon.expiryDate
                    ? new Date(coupon.expiryDate).toLocaleDateString()
                    : "No expiry"}
                </div>
              </div>
              <div className="flex space-x-2 justify-center sm:justify-end">
                <button
                  onClick={() => openEditModal(coupon)}
                  className="flex-1 sm:flex-none bg-blue-900 text-blue-300 hover:bg-blue-800 px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCoupon(coupon._id)}
                  className="flex-1 sm:flex-none bg-red-900 text-red-300 hover:bg-red-800 px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {coupons.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🎟️</div>
          <h3 className="text-lg sm:text-xl font-medium text-white mb-2">
            No coupons yet
          </h3>
          <p className="text-gray-300 mb-4 text-sm sm:text-base px-4">
            Create your first coupon to get started.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add First Coupon
          </button>
        </div>
      )}

      {/* Add Coupon Modal - Mobile Optimized */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                Add New Coupon
              </h2>
              <form
                onSubmit={handleAddCoupon}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Coupon Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SUMMER50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {formData.type === "percentage"
                      ? "Percentage (%)"
                      : "Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Min Value (₹)
                    </label>
                    <input
                      type="number"
                      name="minValue"
                      value={formData.minValue}
                      onChange={handleInputChange}
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Value (₹)
                    </label>
                    <input
                      type="number"
                      name="maxValue"
                      value={formData.maxValue}
                      onChange={handleInputChange}
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    Create Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-full sm:flex-1 bg-gray-600 hover:bg-gray-500 text-gray-300 py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal - Same styling as Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                Edit Coupon
              </h2>
              <form
                onSubmit={handleEditCoupon}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Coupon Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {formData.type === "percentage"
                      ? "Percentage (%)"
                      : "Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Min Value (₹)
                    </label>
                    <input
                      type="number"
                      name="minValue"
                      value={formData.minValue}
                      onChange={handleInputChange}
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Value (₹)
                    </label>
                    <input
                      type="number"
                      name="maxValue"
                      value={formData.maxValue}
                      onChange={handleInputChange}
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    Update Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-full sm:flex-1 bg-gray-600 hover:bg-gray-500 text-gray-300 py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
