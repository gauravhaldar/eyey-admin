"use client";

import { useState, useEffect } from "react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Delete customer function
  const handleDeleteCustomer = async (customerId, customerName) => {
    console.log("🗑️ Delete clicked:", customerName, "ID:", customerId);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${customerName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const url = `${"http://localhost:8000"}/api/admin/customers/${customerId}`;

      console.log("🌐 Making DELETE request to:", url);

      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      console.log("📨 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ Error response:", errorData);
        throw new Error(
          `Failed to delete customer: ${
            errorData?.message || response.statusText
          }`
        );
      }

      console.log("✅ Delete successful");

      // Success notification
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
      successDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Customer deleted successfully!
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);

      // Remove customer from state
      setCustomers(customers.filter((customer) => customer._id !== customerId));
    } catch (error) {
      console.error("💥 Delete error:", error);
      // Error notification
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
      errorDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Failed to delete customer: ${error.message}
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/customers`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        const users = await response.json();
        console.log("Fetched customers:", users); // Debug log
        setCustomers(users || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        // Show error notification
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
        errorDiv.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Failed to fetch customers
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter and search customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    aValue = String(aValue || "").toLowerCase();
    bValue = String(bValue || "").toLowerCase();

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = sortedCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(sortedCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get customer initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Customer Management
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage your registered customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">
                  Total Customers: {customers.length}
                </span>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">
                  Active: {customers.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {customers.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Customers Found
            </h3>
            <p className="text-gray-600 mb-6">
              Customers will appear here once they register for your store.
            </p>
          </div>
        ) : (
          <>
            {/* Search and Sort Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 lg:w-80">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search customers by name or email..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex gap-3 w-full lg:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                    title={`Sort ${
                      sortOrder === "asc" ? "Descending" : "Ascending"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                        sortOrder === "desc" ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Results Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstCustomer + 1}-
                  {Math.min(indexOfLastCustomer, sortedCustomers.length)} of{" "}
                  {sortedCustomers.length} customers
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCustomers.map((customer, index) => (
                      <tr
                        key={customer._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {indexOfFirstCustomer + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div
                                className={`h-12 w-12 rounded-full ${getAvatarColor(
                                  customer.name
                                )} flex items-center justify-center shadow-sm`}
                              >
                                <span className="text-white font-semibold text-sm">
                                  {getInitials(customer.name)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Customer ID: {customer._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email.includes("@gmail.com")
                              ? "Gmail"
                              : customer.email.includes("@yahoo.com")
                              ? "Yahoo"
                              : "Other"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleDeleteCustomer(
                                  customer._id,
                                  customer.name
                                )
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              title="Delete Customer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50"
                      } transition-colors duration-200`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50"
                      } transition-colors duration-200`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page{" "}
                        <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : "text-gray-500 bg-white hover:bg-gray-50"
                          } transition-colors duration-200`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Page Numbers */}
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                                  currentPage === pageNumber
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : "text-gray-500 bg-white hover:bg-gray-50"
                          } transition-colors duration-200`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* No Results State */}
            {sortedCustomers.length === 0 && searchTerm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 mb-4">
                  No customers match your search criteria for "{searchTerm}".
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
