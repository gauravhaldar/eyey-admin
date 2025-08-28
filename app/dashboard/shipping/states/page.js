"use client";

import { useState, useEffect } from "react";

export default function StatesPage() {
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchStatesFromShipping();
  }, []);

  const fetchStatesFromShipping = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/shipping");
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
          acc.push({ _id: current._id, state: current.state, stateCode: current.stateCode, gstCode: current.gstCode });
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
      const res = await fetch(`http://localhost:8000/api/shipping/state/${stateName}`, {
        method: "DELETE",
      });

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
      <h1 className="text-2xl font-bold mb-6">States</h1>

      {/* States Table */}
      {states.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Derived States from Shipping Locations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">ID</th>
                  <th className="px-4 py-2 border-b text-left">State Name</th>
                  <th className="px-4 py-2 border-b text-left">State Code</th>
                  <th className="px-4 py-2 border-b text-left">GST Code</th>
                  <th className="px-4 py-2 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{s._id}</td>
                    <td className="px-4 py-2 border-b">{s.state}</td>
                    <td className="px-4 py-2 border-b">{s.stateCode}</td>
                    <td className="px-4 py-2 border-b">{s.gstCode}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDeleteState(s.state)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No states found from shipping locations.</p>
      )}
    </div>
  );
}
