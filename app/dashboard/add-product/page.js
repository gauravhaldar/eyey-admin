"use client";

import { useState } from "react";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: 0, // Changed from "" to 0
    category: "",
    stock: 0, // Changed from "" to 0
    brand: "",
    description: "",
    frameDimensions: "", // Added for completeness
    productInformation: "", // Added for completeness
    newArrival: false,
    hotSeller: false,
    men: false,
    women: false,
    kids: false,
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      alert("You can only upload up to 4 images");
      return;
    }
    setImages([...images, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparing form data for backend (with images)
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        console.error("Backend response status:", res.status);
        console.error("Backend response data:", errorData);
        throw new Error(`Failed to add product: ${errorData.message || res.statusText}`);
      }

      alert("✅ Product added successfully!");
      setForm({
        name: "",
        price: "",
        category: "",
        stock: "",
        brand: "",
        description: "",
        newArrival: false,
        hotSeller: false,
        men: false,
        women: false,
        kids: false,
      });
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6">➕ Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Price */}
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Category */}
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Stock */}
        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Brand */}
        <input
          type="text"
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Product Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          rows={4}
        />

        {/* Images */}
        <div>
          <label className="block mb-2 font-medium">Upload Images (max 4)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full"
          />
          <div className="flex gap-2 mt-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt="preview"
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>

        {/* Check Options */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="newArrival"
              checked={form.newArrival}
              onChange={handleChange}
            />
            New Arrival
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="hotSeller"
              checked={form.hotSeller}
              onChange={handleChange}
            />
            Hot Seller
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="men"
              checked={form.men}
              onChange={handleChange}
            />
            Men
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="women"
              checked={form.women}
              onChange={handleChange}
            />
            Women
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="kids"
              checked={form.kids}
              onChange={handleChange}
            />
            Kids
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          🚀 Add Product
        </button>
      </form>
    </div>
  );
}
