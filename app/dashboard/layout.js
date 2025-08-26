"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/me", {
          method: "GET",
          credentials: "include", // send cookies
        });

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
      await fetch("http://localhost:8000/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
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
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center relative z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
            title={sidebarVisible ? "Hide Menu" : "Show Menu"}
          >
            <svg
              className="w-6 h-6 text-white"
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
          <div className="text-xl font-bold">Haldar AI & IT</div>
        </div>
        <div className="flex items-center gap-4">
          {admin && <span>👤 {admin.email}</span>}
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Section - Takes remaining height */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Fixed Sidebar */}
        <aside
          className={`${
            sidebarVisible ? "translate-x-0" : "-translate-x-full"
          } fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 transition-transform duration-300 bg-gray-100 border-r z-40 flex-shrink-0`}
        >
          <div className="p-6 h-full overflow-y-auto">
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/add-product");
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  ➕ Add Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/view-products");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  📦 View Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/orders");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  📑 Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/customers");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  👤 Customers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/coupons");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  🎟️ Coupons
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Mobile Overlay - Only shows on mobile when sidebar is open */}
        {sidebarVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16"
            onClick={() => setSidebarVisible(false)}
          ></div>
        )}

        {/* Scrollable Main Content */}
        <main
          className={`flex-1 bg-gray-50 transition-all duration-300 overflow-hidden ${
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
