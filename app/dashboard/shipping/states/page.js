"use client";

import { useState, useEffect } from "react";

export default function StatesPage() {
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchStatesFromShipping();
  }, []);

  const fetchStatesFromShipping = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/shipping`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch shipping data");
      }
      const data = await res.json();

      // Extract unique states from shipping data
      const uniqueStates = data.reduce((acc, current) => {
        const existing = acc.find(
          (item) =>
            item.state === current.state &&
            item.stateCode === current.stateCode &&
            item.gstCode === current.gstCode
        );
        if (!existing) {
          acc.push({
            _id: current._id,
            state: current.state,
            stateCode: current.stateCode,
            gstCode: current.gstCode,
          });
        }
        return acc;
      }, []);

      setStates(uniqueStates);
    } catch (error) {
      console.error("Error fetching states from shipping data:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleDeleteState = async (stateName) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/shipping/state/${stateName}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete shipping rule");
      }

      // Re-fetch the states to update the table
      fetchStatesFromShipping();
      alert("Shipping rule deleted successfully!");
    } catch (error) {
      console.error("Error deleting shipping rule:", error);
      alert("Failed to delete shipping rule. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
        Shipping States
      </h1>

      {/* States Table */}
      {states.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Derived States from Shipping Locations
          </h2>
          <div className="overflow-x-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">State Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">State Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">GST Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {states.map((s) => (
                    <tr key={s._id} className="hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4 text-sm text-gray-200">{s._id}</td>
                      <td className="px-6 py-4 text-sm text-gray-200 font-medium">{s.state}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                          {s.stateCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-200">
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                          {s.gstCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteState(s.state)}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-300 text-lg">No states found from shipping locations.</p>
        </div>
      )}
    </div>
  );
}
