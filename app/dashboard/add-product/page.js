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

  // Bulk image upload states
  const [bulkImageFiles, setBulkImageFiles] = useState([]);
  const [bulkImageProgress, setBulkImageProgress] = useState(false);
  const [bulkImageResult, setBulkImageResult] = useState(null);
  const [bulkImageUploadProgress, setBulkImageUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("single"); // single | bulk

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

  // Bulk image upload functions
  const handleBulkImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = bulkImageFiles.length;
    const newCount = currentCount + files.length;

    if (newCount > 50) {
      alert(
        `Cannot add ${files.length} images. You can only have a maximum of 50 images total. Currently selected: ${currentCount}`
      );
      e.target.value = "";
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        `Invalid file types detected: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}. Please upload only JPEG, PNG, or WebP images.`
      );
      e.target.value = "";
      return;
    }

    // Check for duplicate files by name
    const existingNames = bulkImageFiles.map((file) => file.name);
    const duplicateFiles = files.filter((file) =>
      existingNames.includes(file.name)
    );

    if (duplicateFiles.length > 0) {
      alert(
        `Duplicate files detected: ${duplicateFiles
          .map((f) => f.name)
          .join(", ")}. These files are already selected.`
      );
      e.target.value = "";
      return;
    }

    // Add new files to existing selection
    setBulkImageFiles((prev) => [...prev, ...files]);
    setBulkImageResult(null);

    // Clear the input so the same files can be selected again if needed
    e.target.value = "";
  };

  const removeImageFile = (indexToRemove) => {
    setBulkImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setBulkImageResult(null);
  };

  const clearAllImages = () => {
    setBulkImageFiles([]);
    setBulkImageResult(null);
  };

  const handleBulkImageUpload = async () => {
    if (bulkImageFiles.length === 0) {
      alert("Please select images to upload");
      return;
    }

    setBulkImageProgress(true);
    setBulkImageResult(null);
    setBulkImageUploadProgress(0);

    const formData = new FormData();
    bulkImageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setBulkImageUploadProgress((prev) => {
          if (prev >= bulkImageFiles.length) {
            clearInterval(progressInterval);
            return bulkImageFiles.length;
          }
          return prev + 1;
        });
      }, 100);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/bulk-upload-images`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      clearInterval(progressInterval);
      setBulkImageUploadProgress(bulkImageFiles.length);

      const result = await res.json();

      if (res.ok) {
        setBulkImageResult({
          success: true,
          message: result.message,
          uploadedImages: result.uploadedImages,
          errors: result.errors || [],
          summary: result.summary,
        });
        setBulkImageFiles([]);
        setBulkImageUploadProgress(0);
      } else {
        setBulkImageResult({
          success: false,
          message: result.message,
          errors: result.errors || [],
        });
      }
    } catch (error) {
      console.error("Bulk image upload error:", error);
      setBulkImageResult({
        success: false,
        message: "Failed to upload images",
        errors: [{ message: error.message }],
      });
    } finally {
      setBulkImageProgress(false);
    }
  };

  const copyImageUrls = () => {
    if (bulkImageResult && bulkImageResult.uploadedImages) {
      const urls = bulkImageResult.uploadedImages
        .map((img) => img.cloudinary.url)
        .join("|");
      navigator.clipboard
        .writeText(urls)
        .then(() => {
          alert(
            "Image URLs copied to clipboard! You can paste them in the CSV images column."
          );
        })
        .catch((err) => {
          console.error("Failed to copy URLs:", err);
          alert("Failed to copy URLs to clipboard");
        });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy to clipboard");
      });
  };

  const copyAllImageUrls = () => {
    if (bulkImageResult && bulkImageResult.uploadedImages) {
      const successfulUrls = bulkImageResult.uploadedImages
        .filter((img) => img.cloudinary && img.cloudinary.url)
        .map((img) => img.cloudinary.url)
        .join(", ");

      navigator.clipboard
        .writeText(successfulUrls)
        .then(() => {
          alert("All image URLs copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy URLs:", err);
          alert("Failed to copy URLs to clipboard");
        });
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-gray-800/80 backdrop-blur shadow-2xl rounded-2xl p-6 md:p-8 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-700 ring-1 ring-gray-600/60">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-gray-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">Add New Product</h2>
          <p className="text-sm text-gray-400">Create a single product or use the bulk tools below.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("single")}
          className={`${activeTab === "single" ? "bg-gray-700 text-white" : "bg-gray-700/40 text-gray-300 hover:bg-gray-700/60"} px-4 py-2 rounded-lg border border-gray-600 transition-colors`}
        >
          Single Product
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bulk")}
          className={`${activeTab === "bulk" ? "bg-gray-700 text-white" : "bg-gray-700/40 text-gray-300 hover:bg-gray-700/60"} px-4 py-2 rounded-lg border border-gray-600 transition-colors`}
        >
          Bulk Tools
        </button>
      </div>

      {/* Bulk Upload Section */}
      {activeTab === "bulk" && (
      <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-600">
        <div className="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-blue-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 3.75h6.75L19.5 9.5V20.25A2.25 2.25 0 0117.25 22.5H7A2.25 2.25 0 014.75 20.25V6A2.25 2.25 0 017 3.75z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-300">Bulk Upload Products</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Upload multiple products at once using a CSV file. Make sure your CSV
          follows the required format.
        </p>

        {/* Format Instructions */}
        <div className="mb-4 p-4 bg-gray-700/70 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-blue-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75H8.25A2.25 2.25 0 006 6v12.75A2.25 2.25 0 008.25 21h7.5A2.25 2.25 0 0018 18.75V6a2.25 2.25 0 00-2.25-2.25h-1.5m-4.5 0A1.5 1.5 0 0012 2.25 1.5 1.5 0 0013.5 3.75h-3.75z" />
            </svg>
            <p className="text-sm font-medium text-blue-300">CSV Format Requirements:</p>
          </div>
          <ul className="text-xs text-gray-300 space-y-1">
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
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5L16.5 12M12 3v13.5" />
              </svg>
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* CSV File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUploadFileChange}
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-lg"
            />
          </div>

          {/* Upload Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={!bulkUploadFile || bulkUploadProgress}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {bulkUploadProgress ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3m0 13.5l-4.5-4.5M12 16.5l4.5-4.5M3 21h18" />
                  </svg>
                  <span>Upload Products</span>
                </>
              )}
            </button>
          </div>

          {/* Upload Result */}
          {bulkUploadResult && (
            <div
              className={`p-4 rounded-lg ${
                bulkUploadResult.success
                  ? "bg-green-900 border border-green-700"
                  : "bg-red-900 border border-red-700"
              }`}
            >
              <p
                className={`font-medium ${
                  bulkUploadResult.success ? "text-green-300" : "text-red-300"
                }`}
              >
                {bulkUploadResult.message}
              </p>
              {bulkUploadResult.createdCount > 0 && (
                <p className="text-sm text-green-400 mt-1">
                  Successfully created {bulkUploadResult.createdCount} products
                </p>
              )}
              {bulkUploadResult.errors &&
                bulkUploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-300">
                      Errors found:
                    </p>
                    <ul className="text-xs text-red-400 mt-1 max-h-32 overflow-y-auto">
                      {bulkUploadResult.errors
                        .slice(0, 10)
                        .map((error, index) => (
                          <li key={index} className="mb-1">
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                      {bulkUploadResult.errors.length > 10 && (
                        <li className="text-red-300 font-medium">
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
      )}

      {/* Bulk Image Upload Section */}
      {activeTab === "bulk" && (
      <div className="mb-8 bg-gray-800 border border-gray-600 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l8.25 4.5 8.25-4.5M3.75 12l8.25 4.5 8.25-4.5M3.75 16.5L12 21l8.25-4.5" />
          </svg>
          <h3 className="text-lg font-semibold">Bulk Image Upload (Max 50 Images)</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Upload multiple images to Cloudinary and get URLs to use in your CSV
          files. You can add images one by one or select multiple at once.
          Maximum 50 images total.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Images (Add one by one or multiple at once)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBulkImageFilesChange}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">
                Selected: {bulkImageFiles.length}/50 images
                {bulkImageFiles.length > 50 && (
                  <span className="text-red-400 ml-1">(Exceeds limit)</span>
                )}
              </p>
              {bulkImageFiles.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Selected Images Preview */}
          {bulkImageFiles.length > 0 && (
            <div className="bg-gray-800 border border-gray-600 rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Selected Images:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {bulkImageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-600 border border-gray-500 rounded p-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs text-gray-300 truncate flex-1"
                        title={file.name}
                      >
                        {file.name.length > 15
                          ? file.name.substring(0, 15) + "..."
                          : file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImageFile(index)}
                        className="ml-1 text-red-400 hover:text-red-300 text-xs inline-flex items-center gap-1"
                        title="Remove this image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Remove</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleBulkImageUpload}
            disabled={
              bulkImageFiles.length === 0 ||
              bulkImageFiles.length > 50 ||
              bulkImageProgress
            }
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {bulkImageProgress ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3m0 13.5l-4.5-4.5M12 16.5l4.5-4.5M3 21h18" />
                </svg>
                <span>Upload Images to Cloudinary</span>
              </>
            )}
          </button>

          {/* Upload Progress */}
          {bulkImageProgress && (
            <div className="bg-gray-800 border border-gray-600 rounded-md p-3">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Uploading images...</span>
                <span>
                  {bulkImageFiles.length > 0
                    ? Math.round(
                        (bulkImageUploadProgress / bulkImageFiles.length) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      bulkImageFiles.length > 0
                        ? (bulkImageUploadProgress / bulkImageFiles.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {bulkImageResult && (
            <div className="bg-gray-800 border border-gray-600 rounded-md p-4">
              <h4 className="font-medium text-gray-300 mb-3">
                Upload Results:
              </h4>
              {bulkImageResult.success ? (
                <div className="space-y-2">
                  <p className="text-green-400 text-sm mb-3">{bulkImageResult.message}</p>
                  {bulkImageResult.uploadedImages &&
                    bulkImageResult.uploadedImages.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {bulkImageResult.uploadedImages.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm"
                          >
                            <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-green-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                              <span className="truncate max-w-xs">
                                {result.originalName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={result.cloudinary.url}
                                readOnly
                                className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-xs w-48"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(result.cloudinary.url)
                                }
                              className="inline-flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                              >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6A2.25 2.25 0 0110.5 3.75h6.75A2.25 2.25 0 0119.5 6v10.5A2.25 2.25 0 0117.25 18.75H10.5A2.25 2.25 0 018.25 16.5V15M6 7.5H5.25A2.25 2.25 0 003 9.75v8.25A2.25 2.25 0 005.25 20.25h8.25A2.25 2.25 0 0015.75 18V9.75A2.25 2.25 0 0013.5 7.5H6z" />
                              </svg>
                              <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Copy All URLs Button */}
                  {bulkImageResult.uploadedImages &&
                    bulkImageResult.uploadedImages.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <button
                          type="button"
                          onClick={copyAllImageUrls}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6A2.25 2.25 0 0110.5 3.75h6.75A2.25 2.25 0 0119.5 6v10.5A2.25 2.25 0 0117.25 18.75H10.5A2.25 2.25 0 018.25 16.5V15M6 7.5H5.25A2.25 2.25 0 003 9.75v8.25A2.25 2.25 0 005.25 20.25h8.25A2.25 2.25 0 0015.75 18V9.75A2.25 2.25 0 0013.5 7.5H6z" />
                        </svg>
                        <span>Copy All URLs</span>
                        </button>
                        <p className="text-xs text-gray-400 mt-1">
                          Copies all successful URLs separated by commas for
                          easy pasting into CSV files.
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-red-400">
                  <p className="text-sm mb-2">{bulkImageResult.message}</p>
                  {bulkImageResult.errors &&
                    bulkImageResult.errors.length > 0 && (
                      <div className="space-y-1">
                        {bulkImageResult.errors.map((error, index) => (
                          <p key={index} className="text-xs">
                            {error.message}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Divider */}
      {activeTab === "single" && (
      <div className="mb-8 border-t border-gray-700 pt-6">
        <div className="flex items-center gap-2 mb-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.651-1.652a1.875 1.875 0 112.652 2.652l-9.193 9.193a4.5 4.5 0 01-1.897 1.13L6 16.5l.69-4.075a4.5 4.5 0 011.13-1.897l9.042-9.041z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
          </svg>
          <h3 className="text-lg font-semibold">Add Single Product</h3>
        </div>
      </div>
      )}

      {activeTab === "single" && (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Product Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Ray-Ban Aviator Sunglasses"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg bg-gray-700 text-white ${
              errors.name ? "border-red-500" : "border-gray-600"
            }`}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price *
          </label>
          <input
            type="number"
            name="price"
            placeholder="e.g., 150"
            value={form.price}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg bg-gray-700 text-white ${
              errors.price ? "border-red-500" : "border-gray-600"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category *
          </label>
          <input
            type="text"
            name="category"
            placeholder="e.g., Sunglasses"
            value={form.category}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg bg-gray-700 text-white ${
              errors.category ? "border-red-500" : "border-gray-600"
            }`}
            required
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            placeholder="e.g., 25"
            value={form.stock}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg bg-gray-700 text-white ${
              errors.stock ? "border-red-500" : "border-gray-600"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Brand *
          </label>
          <input
            type="text"
            name="brand"
            placeholder="e.g., Ray-Ban"
            value={form.brand}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg bg-gray-700 text-white ${
              errors.brand ? "border-red-500" : "border-gray-600"
            }`}
            required
          />
          {errors.brand && (
            <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product Description *
          </label>
          <textarea
            name="description"
            placeholder="e.g., Classic aviator sunglasses with premium UV protection and durable metal frame..."
            value={form.description}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg bg-gray-700 text-white ${
              errors.description ? "border-red-500" : "border-gray-600"
            }`}
            rows={4}
            required
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Frame Dimensions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frame Dimensions
          </label>
          <input
            type="text"
            name="frameDimensions"
            placeholder="e.g., 58-14-140 mm"
            value={form.frameDimensions}
            onChange={handleChange}
            className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg"
          />
        </div>

        {/* Product Information */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product Information
          </label>
          <textarea
            name="productInformation"
            placeholder="e.g., Material: Metal frame, Glass lenses. Features: UV400 protection, Anti-reflective coating..."
            value={form.productInformation}
            onChange={handleChange}
            className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg"
            rows={3}
          />
        </div>

        {/* Images */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Images (max 4) *
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={`w-full p-2 border rounded-lg bg-gray-700 text-white ${
              errors.images ? "border-red-500" : "border-gray-600"
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
                  className="w-20 h-20 object-cover rounded border border-gray-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages(images.filter((_, index) => index !== i))
                  }
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Product Categories
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white">
              <input
                type="checkbox"
                name="newArrival"
                checked={form.newArrival}
                onChange={handleChange}
                className="text-blue-500"
              />
              <span>New Arrival</span>
            </label>

            <label className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white">
              <input
                type="checkbox"
                name="hotSeller"
                checked={form.hotSeller}
                onChange={handleChange}
                className="text-blue-500"
              />
              <span>Hot Seller</span>
            </label>

            <label className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white">
              <input
                type="checkbox"
                name="men"
                checked={form.men}
                onChange={handleChange}
                className="text-blue-500"
              />
              <span>Men</span>
            </label>

            <label className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white">
              <input
                type="checkbox"
                name="women"
                checked={form.women}
                onChange={handleChange}
                className="text-blue-500"
              />
              <span>Women</span>
            </label>

            <label className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white">
              <input
                type="checkbox"
                name="kids"
                checked={form.kids}
                onChange={handleChange}
                className="text-blue-500"
              />
              <span>Kids</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12h13.5m-6.75-6.75L18.75 12l-6.75 6.75" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
