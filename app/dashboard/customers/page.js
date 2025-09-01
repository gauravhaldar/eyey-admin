"use client";
import { useState, useEffect } from "react";

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/customers`,
          {
            credentials: "include",
          }
        );
        const users = await response.json();
        setCustomers(users);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Customers</h1>
        <p className="text-gray-600">Manage your registered customers</p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            Total Customers: {customers.length}
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold text-gray-700">#</div>
            <div className="font-semibold text-gray-700">Name</div>
            <div className="font-semibold text-gray-700">Email</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {customers.map((customer, index) => (
            <div
              key={customer._id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-gray-600 font-medium">{index + 1}</div>
                <div className="text-gray-900 font-medium">{customer.name}</div>
                <div className="text-gray-600">{customer.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {customers.map((customer, index) => (
          <div
            key={customer._id}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 font-medium">
                #{index + 1}
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Customer
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {customer.name}
            </h3>
            <p className="text-gray-600 text-sm">{customer.email}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No customers yet
          </h3>
          <p className="text-gray-600">
            Customers will appear here once they register.
          </p>
        </div>
      )}
    </div>
  );
}
