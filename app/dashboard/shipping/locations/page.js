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
      const res = await fetch("http://localhost:8000/api/shipping");
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
      const res = await fetch(`http://localhost:8000/api/shipping/${id}`, {
        method: "DELETE",
      });

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
      <h1 className="text-2xl font-bold mb-6">Zip Codes</h1>

      <button
        onClick={handleAddZipCode}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-6"
      >
        ➕ Add Zip Codes
      </button>

      {/* Zip Codes Table */}
      {zipCodes.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Existing Zip Codes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">ID</th>
                  <th className="px-4 py-2 border-b text-left">Code</th>
                  <th className="px-4 py-2 border-b text-left">Charge</th>
                  <th className="px-4 py-2 border-b text-left">Price Less Than</th>
                  <th className="px-4 py-2 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {zipCodes.map((zc) => (
                  <tr key={zc._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{zc._id}</td>
                    <td className="px-4 py-2 border-b">{zc.zipCode}</td>
                    <td className="px-4 py-2 border-b">₹{zc.charges ? zc.charges.toFixed(2) : '0.00'}</td>
                    <td className="px-4 py-2 border-b">₹{zc.priceLessThan ? zc.priceLessThan.toFixed(2) : '0.00'}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDeleteZipCode(zc._id)}
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
        <p>No zip codes found. Add a new zip code to get started.</p>
      )}
    </div>
  );
}
