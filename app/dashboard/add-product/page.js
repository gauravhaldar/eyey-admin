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

  // Bulk upload states
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

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

  // Bulk upload functions
  const handleBulkUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setBulkUploadFile(file);
      setBulkUploadResult(null);
    } else {
      alert("Please select a valid CSV file");
      e.target.value = "";
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      alert("Please select a CSV file first");
      return;
    }

    setBulkUploadProgress(true);
    setBulkUploadResult(null);

    const formData = new FormData();
    formData.append("csvFile", bulkUploadFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/bulk-upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await res.json();

      if (res.ok) {
        setBulkUploadResult({
          success: true,
          message: result.message,
          createdCount: result.products ? result.products.length : 0,
          errors: result.errors || [],
        });
        setBulkUploadFile(null);
        document.querySelector('input[type="file"][accept=".csv"]').value = "";
      } else {
        setBulkUploadResult({
          success: false,
          message: result.message,
          errors: result.errors || [],
        });
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      setBulkUploadResult({
        success: false,
        message: "Failed to upload CSV file",
        errors: [{ message: error.message }],
      });
    } finally {
      setBulkUploadProgress(false);
    }
  };

  const downloadCSVTemplate = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/csv-template`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "product_upload_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download CSV template");
      }
    } catch (error) {
      console.error("Download template error:", error);
      alert("Failed to download CSV template");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6">➕ Add New Product</h2>

      {/* Bulk Upload Section */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">
          📊 Bulk Upload Products
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload multiple products at once using a CSV file. Make sure your CSV
          follows the required format.
        </p>

        {/* Format Instructions */}
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">
            📋 CSV Format Requirements:
          </p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • Required fields: name, price, category, stock, brand,
              description
            </li>
            <li>
              • Boolean fields (newArrival, hotSeller, men, women, kids): use
              "true" or "false"
            </li>
            <li>
              • Multiple images: separate URLs with "|" (pipe symbol), not
              commas
            </li>
            <li>• Example: https://image1.jpg|https://image2.jpg</li>
          </ul>
        </div>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📥 Download CSV Template
            </button>
          </div>

          {/* CSV File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUploadFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Upload Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={!bulkUploadFile || bulkUploadProgress}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {bulkUploadProgress ? "⏳ Uploading..." : "🚀 Upload Products"}
            </button>
          </div>

          {/* Upload Result */}
          {bulkUploadResult && (
            <div
              className={`p-4 rounded-lg ${
                bulkUploadResult.success
                  ? "bg-green-100 border border-green-300"
                  : "bg-red-100 border border-red-300"
              }`}
            >
              <p
                className={`font-medium ${
                  bulkUploadResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {bulkUploadResult.message}
              </p>
              {bulkUploadResult.createdCount > 0 && (
                <p className="text-sm text-green-700 mt-1">
                  Successfully created {bulkUploadResult.createdCount} products
                </p>
              )}
              {bulkUploadResult.errors &&
                bulkUploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700">
                      Errors found:
                    </p>
                    <ul className="text-xs text-red-600 mt-1 max-h-32 overflow-y-auto">
                      {bulkUploadResult.errors
                        .slice(0, 10)
                        .map((error, index) => (
                          <li key={index} className="mb-1">
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                      {bulkUploadResult.errors.length > 10 && (
                        <li className="text-red-500 font-medium">
                          ... and {bulkUploadResult.errors.length - 10} more
                          errors
                        </li>
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          📝 Add Single Product
        </h3>
      </div>

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
          🚀 Add Product
        </button>
      </form>
    </div>
  );
}
