"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [shippingDropdownOpen, setShippingDropdownOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/me`,
          {
            method: "GET",
            credentials: "include", // send cookies
          }
        );

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setAdmin(data); // ✅ set admin state
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false); // ✅ hide loader
      }
    };

    verifyAdmin();

    // Set initial sidebar visibility based on screen size
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/admin/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <p className="text-lg text-white">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 text-white p-4 flex justify-between items-center relative z-50 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
            title={sidebarVisible ? "Hide Menu" : "Show Menu"}
          >
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="text-xl font-bold text-white">
            Haldar AI & IT Admin
          </div>
        </div>
        <div className="flex items-center gap-4">
          {admin && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300">{admin.email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center gap-2 text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </span>
          </button>
        </div>
      </nav>

      {/* Main Section - Takes remaining height */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Fixed Sidebar */}
        <aside
          className={`${
            sidebarVisible ? "translate-x-0" : "-translate-x-full"
          } fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 transition-transform duration-300 bg-gray-800 border-r border-gray-700 z-40 flex-shrink-0 shadow-lg`}
        >
          <div className="p-6 h-full overflow-y-auto">
            <ul className="space-y-2">
              {/* Dashboard Section */}
              <li className="mb-4">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</h3>
                </div>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <span className="font-medium">Overview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/add-product");
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium">Add Products</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/view-products");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="font-medium">View Products</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/orders");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">Orders</span>
                </button>
              </li>
              {/* Staffs */}
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/staffs");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-1a6 6 0 00-9-5.197M9 20H4v-1a6 6 0 019-5.197M12 12a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                  </div>
                  <span className="font-medium">Staffs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/customers");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Customers</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/coupons");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="font-medium">Coupons</span>
                </button>
              </li>
              {/* New Shipping Settings Dropdown */}
              <li>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShippingDropdownOpen(!shippingDropdownOpen)
                    }
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <span className="font-medium">Shipping Settings</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transform ${
                        shippingDropdownOpen ? "rotate-180" : "rotate-0"
                      } transition-transform duration-300`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {shippingDropdownOpen && (
                    <ul className="pl-4 mt-2 space-y-1">
                      <li>
                        <button
                          onClick={() => {
                            router.push("/dashboard/shipping/locations");
                            if (window.innerWidth < 1024)
                              setSidebarVisible(false);
                          }}
                          className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-400 flex items-center gap-3 text-sm"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span>Shipping Locations</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            router.push("/dashboard/shipping/states");
                            if (window.innerWidth < 1024)
                              setSidebarVisible(false);
                          }}
                          className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 text-gray-400 flex items-center gap-3 text-sm"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <span>States</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* Mobile Overlay - Only shows on mobile when sidebar is open */}
        {sidebarVisible && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden top-16"
            onClick={() => setSidebarVisible(false)}
          ></div>
        )}

        {/* Scrollable Main Content */}
        <main
          className={`flex-1 bg-gray-900 transition-all duration-300 overflow-hidden ${
            sidebarVisible ? "lg:ml-64" : "ml-0"
          }`}
        >
          {/* Content wrapper with scroll */}
          <div className="h-full overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
