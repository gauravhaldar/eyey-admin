"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddZipCodePage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [charge, setCharge] = useState("");
  const [priceLessThan, setPriceLessThan] = useState("");
  const [state, setState] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [gstCode, setGstCode] = useState("");

  const handleCreateZipCode = async () => {
    // Basic validation
    if (!zipCode || !charge || !priceLessThan || !state || !stateCode || !gstCode) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/shipping/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zipCode,
          charges: parseFloat(charge),
          priceLessThan: parseFloat(priceLessThan),
          state,
          stateCode,
          gstCode,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create zip code");
      }

      alert("Zip Code Created Successfully!");

      // Navigate back to the shipping locations page
      router.push("/dashboard/shipping/locations");
    } catch (error) {
      console.error("Error creating zip code:", error);
      alert("Failed to create zip code. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Zip Code</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            Zip Code
          </label>
          <input
            type="text"
            id="zipCode"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="charge" className="block text-sm font-medium text-gray-700">
            Charge
          </label>
          <input
            type="number"
            id="charge"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={charge}
            onChange={(e) => setCharge(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="priceLessThan" className="block text-sm font-medium text-gray-700">
            Price Less Than
          </label>
          <input
            type="number"
            id="priceLessThan"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={priceLessThan}
            onChange={(e) => setPriceLessThan(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            id="state"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="stateCode" className="block text-sm font-medium text-gray-700">
            State Code
          </label>
          <input
            type="text"
            id="stateCode"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="gstCode" className="block text-sm font-medium text-gray-700">
            GST Code
          </label>
          <input
            type="text"
            id="gstCode"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={gstCode}
            onChange={(e) => setGstCode(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => router.push("/dashboard/shipping/locations")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateZipCode}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Create Zip Code
        </button>
      </div>
    </div>
  );
}
