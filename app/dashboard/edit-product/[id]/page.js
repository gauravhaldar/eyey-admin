"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

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
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/products/${productId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const product = await response.json();
      setForm({
        name: product.name || "",
        price: product.price || 0,
        category: product.category || "",
        stock: product.stock || 0,
        brand: product.brand || "",
        description: product.description || "",
        frameDimensions: product.frameDimensions || "",
        productInformation: product.productInformation || "",
        newArrival: product.newArrival || false,
        hotSeller: product.hotSeller || false,
        men: product.men || false,
        women: product.women || false,
        kids: product.kids || false,
      });
      setExistingImages(product.images || []);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to load product data");
      router.push("/dashboard/view-products");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

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
    if (files.length + images.length + existingImages.length > 4) {
      alert("You can only have up to 4 images total");
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

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
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
    if (images.length + existingImages.length === 0)
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

    // Add new images
    images.forEach((img) => formData.append("images", img));

    // Add existing images URLs (to keep them)
    existingImages.forEach((img) =>
      formData.append("existingImages", JSON.stringify(img))
    );

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/products/${productId}`,
        {
          method: "PUT",
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
          `Failed to update product: ${errorData.message || res.statusText}`
        );
      }

      alert("✅ Product updated successfully!");
      router.push("/dashboard/view-products");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">✏️ Edit Product</h2>
          <button
            onClick={() => router.push("/dashboard/view-products")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
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
              Product Images (max 4 total) *
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img.url}
                        alt="existing"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
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

            {/* New Images Preview */}
            {images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              💾 Update Product
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/view-products")}
              className="px-6 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
