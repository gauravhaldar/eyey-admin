"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShippingLocationsPage() {
  const router = useRouter();
  const [zipCodes, setZipCodes] = useState([]);

  useEffect(() => {
    fetchZipCodes();
  }, []);

  const fetchZipCodes = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/shipping`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch zip codes");
      }
      const data = await res.json();
      setZipCodes(data);
    } catch (error) {
      console.error("Error fetching zip codes:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleAddZipCode = () => {
    router.push("/dashboard/shipping/locations/add");
  };

  const handleDeleteZipCode = async (id) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/shipping/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete zip code");
      }

      // Remove the deleted zip code from the local state
      setZipCodes(zipCodes.filter((zc) => zc._id !== id));
      alert("Zip Code Deleted Successfully!");
    } catch (error) {
      console.error("Error deleting zip code:", error);
      alert("Failed to delete zip code. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
        Shipping Locations
      </h1>

      <button
        onClick={handleAddZipCode}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Zip Codes
      </button>

      {/* Zip Codes Table */}
      {zipCodes.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Existing Zip Codes</h2>
          <div className="overflow-x-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">Zip Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">Charge</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">
                      Price Less Than
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {zipCodes.map((zc) => (
                    <tr key={zc._id} className="hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4 text-sm text-gray-200">{zc._id}</td>
                      <td className="px-6 py-4 text-sm text-gray-200 font-medium">{zc.zipCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                          ₹{zc.charges ? zc.charges.toFixed(2) : "0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-200">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                          ₹{zc.priceLessThan ? zc.priceLessThan.toFixed(2) : "0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteZipCode(zc._id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-300 text-lg">No zip codes found. Add a new zip code to get started.</p>
        </div>
      )}
    </div>
  );
}
