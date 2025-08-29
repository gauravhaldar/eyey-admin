"use client";

import { useState } from "react";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "",
    stock: 0,
    brand: "",
    description: "",
    frameDimensions: "",
    productInformation: "",
    newArrival: false,
    hotSeller: false,
    men: false,
    women: false,
    kids: false,
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      alert("You can only upload up to 4 images");
      return;
    }
    setImages([...images, ...files]);

    // Clear image error if present
    if (errors.images) {
      setErrors({
        ...errors,
        images: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || form.price <= 0)
      newErrors.price = "Valid price is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.stock || form.stock < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!form.brand.trim()) newErrors.brand = "Brand is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

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
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        console.error("Backend response status:", res.status);
        console.error("Backend response data:", errorData);
        throw new Error(
          `Failed to add product: ${errorData.message || res.statusText}`
        );
      }

      alert("✅ Product added successfully!");
      setForm({
        name: "",
        price: 0,
        category: "",
        stock: 0,
        brand: "",
        description: "",
        frameDimensions: "",
        productInformation: "",
        newArrival: false,
        hotSeller: false,
        men: false,
        women: false,
        kids: false,
      });
      setImages([]);
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6">➕ Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Ray-Ban Aviator Sunglasses"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="number"
            name="price"
            placeholder="e.g., 150"
            value={form.price}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            step="0.01"
            required
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <input
            type="text"
            name="category"
            placeholder="e.g., Sunglasses"
            value={form.category}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            placeholder="e.g., 25"
            value={form.stock}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${
              errors.stock ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            required
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand *
          </label>
          <input
            type="text"
            name="brand"
            placeholder="e.g., Ray-Ban"
            value={form.brand}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${
              errors.brand ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.brand && (
            <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description *
          </label>
          <textarea
            name="description"
            placeholder="e.g., Classic aviator sunglasses with premium UV protection and durable metal frame..."
            value={form.description}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
            required
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Frame Dimensions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frame Dimensions
          </label>
          <input
            type="text"
            name="frameDimensions"
            placeholder="e.g., 58-14-140 mm"
            value={form.frameDimensions}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Product Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Information
          </label>
          <textarea
            name="productInformation"
            placeholder="e.g., Material: Metal frame, Glass lenses. Features: UV400 protection, Anti-reflective coating..."
            value={form.productInformation}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (max 4) *
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={`w-full p-2 border rounded-lg ${
              errors.images ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}
          <div className="flex gap-2 mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages(images.filter((_, index) => index !== i))
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Product Categories
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                name="newArrival"
                checked={form.newArrival}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span>New Arrival</span>
            </label>

            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                name="hotSeller"
                checked={form.hotSeller}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span>Hot Seller</span>
            </label>

            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                name="men"
                checked={form.men}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span>Men</span>
            </label>

            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                name="women"
                checked={form.women}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span>Women</span>
            </label>

            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                name="kids"
                checked={form.kids}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span>Kids</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
