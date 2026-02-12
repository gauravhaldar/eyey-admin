"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

const STATUS_COLORS = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    SUSPENDED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function VendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [toast, setToast] = useState(null);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const query = filter !== "ALL" ? `?status=${filter}` : "";
            const res = await fetch(`${API_URL}/api/admin/vendors${query}`, {
                credentials: "include",
            });
            const data = await res.json();
            setVendors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching vendors:", err);
            showToast("Failed to fetch vendors", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [filter]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleApprove = async (id) => {
        if (!confirm("Approve this vendor? A password will be generated and emailed to them.")) return;
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/api/admin/vendors/${id}/approve`, {
                method: "PATCH",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message);
                fetchVendors();
            } else {
                showToast(data.message || "Failed to approve", "error");
            }
        } catch (err) {
            showToast("Error approving vendor", "error");
        } finally {
            setActionLoading("");
        }
    };

    const handleReject = async () => {
        if (!selectedVendor) return;
        setActionLoading(selectedVendor._id);
        try {
            const res = await fetch(
                `${API_URL}/api/admin/vendors/${selectedVendor._id}/reject`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason: rejectReason }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                showToast("Vendor rejected successfully.");
                setShowRejectModal(false);
                setRejectReason("");
                setSelectedVendor(null);
                fetchVendors();
            } else {
                showToast(data.message || "Failed to reject", "error");
            }
        } catch (err) {
            showToast("Error rejecting vendor", "error");
        } finally {
            setActionLoading("");
        }
    };

    const handleSuspend = async (id) => {
        if (!confirm("Suspend this vendor? They will lose access to their dashboard.")) return;
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/api/admin/vendors/${id}/suspend`, {
                method: "PATCH",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Vendor suspended successfully.");
                fetchVendors();
            } else {
                showToast(data.message || "Failed to suspend", "error");
            }
        } catch (err) {
            showToast("Error suspending vendor", "error");
        } finally {
            setActionLoading("");
        }
    };

    const handleResendEmail = async (id) => {
        if (!confirm("Resend credentials? This will generate a NEW password and email it to the vendor.")) return;
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/api/admin/vendors/${id}/resend-email`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message);
            } else {
                showToast(data.message || "Failed to resend email", "error");
            }
        } catch (err) {
            showToast("Error resending email", "error");
        } finally {
            setActionLoading("");
        }
    };

    const openDetailModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowDetailModal(true);
    };

    const openRejectModal = (vendor) => {
        setSelectedVendor(vendor);
        setRejectReason("");
        setShowRejectModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-in slide-in-from-top-5 ${toast.type === "error"
                        ? "bg-red-900/80 border-red-700/50 text-red-200"
                        : "bg-green-900/80 border-green-700/50 text-green-200"
                        }`}
                >
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Review, approve, and manage marketplace vendors
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-xl border border-gray-700">
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s
                                ? "bg-purple-600 text-white shadow"
                                : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : vendors.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-sm">No vendors found for filter: <span className="font-semibold text-white">{filter}</span></p>
                </div>
            ) : (
                /* Vendor Table */
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Business</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Owner</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {vendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openDetailModal(vendor)}
                                                className="text-sm font-semibold text-white hover:text-purple-400 transition-colors text-left"
                                            >
                                                {vendor.businessName}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{vendor.ownerName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{vendor.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{vendor.productCategory}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_COLORS[vendor.status]}`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(vendor.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDetailModal(vendor)}
                                                    title="View Details"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                {(vendor.status === "PENDING" || vendor.status === "REJECTED") && (
                                                    <button
                                                        onClick={() => handleApprove(vendor._id)}
                                                        disabled={actionLoading === vendor._id}
                                                        title="Approve"
                                                        className="p-2 rounded-lg text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                )}
                                                {vendor.status === "PENDING" && (
                                                    <button
                                                        onClick={() => openRejectModal(vendor)}
                                                        title="Reject"
                                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                                {vendor.status === "APPROVED" && (
                                                    <button
                                                        onClick={() => handleResendEmail(vendor._id)}
                                                        disabled={actionLoading === vendor._id}
                                                        title="Resend Credentials Email"
                                                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    </button>
                                                )}
                                                {vendor.status === "APPROVED" && (
                                                    <button
                                                        onClick={() => handleSuspend(vendor._id)}
                                                        disabled={actionLoading === vendor._id}
                                                        title="Suspend"
                                                        className="p-2 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vendor Detail Modal */}
            {showDetailModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Vendor Details</h2>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-white">{selectedVendor.businessName}</span>
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${STATUS_COLORS[selectedVendor.status]}`}>{selectedVendor.status}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Owner</p>
                                    <p className="text-gray-200 font-medium">{selectedVendor.ownerName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-gray-200 font-medium">{selectedVendor.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Mobile</p>
                                    <p className="text-gray-200 font-medium">{selectedVendor.mobile}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Category</p>
                                    <p className="text-gray-200 font-medium">{selectedVendor.productCategory}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">GST Number</p>
                                    <p className="text-gray-200 font-medium font-mono">{selectedVendor.gstNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">PAN Number</p>
                                    <p className="text-gray-200 font-medium font-mono">{selectedVendor.panNumber}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Address</p>
                                <p className="text-gray-200 font-medium text-sm">{selectedVendor.address}</p>
                            </div>

                            {selectedVendor.bankDetails && (
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Bank Details</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {selectedVendor.bankDetails.accountHolderName && (
                                            <div><p className="text-gray-500 text-xs">Account Holder</p><p className="text-gray-200">{selectedVendor.bankDetails.accountHolderName}</p></div>
                                        )}
                                        {selectedVendor.bankDetails.bankName && (
                                            <div><p className="text-gray-500 text-xs">Bank</p><p className="text-gray-200">{selectedVendor.bankDetails.bankName}</p></div>
                                        )}
                                        {selectedVendor.bankDetails.ifscCode && (
                                            <div><p className="text-gray-500 text-xs">IFSC</p><p className="text-gray-200 font-mono">{selectedVendor.bankDetails.ifscCode}</p></div>
                                        )}
                                        {selectedVendor.bankDetails.accountNumber && (
                                            <div><p className="text-gray-500 text-xs">Account No.</p><p className="text-gray-200 font-mono">••••{selectedVendor.bankDetails.accountNumber.slice(-4)}</p></div>
                                        )}
                                        {selectedVendor.bankDetails.upiId && (
                                            <div><p className="text-gray-500 text-xs">UPI ID</p><p className="text-gray-200">{selectedVendor.bankDetails.upiId}</p></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedVendor.rejectionReason && (
                                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                                    <p className="text-red-300 text-sm"><strong>Rejection Reason:</strong> {selectedVendor.rejectionReason}</p>
                                </div>
                            )}

                            <div className="text-xs text-gray-500">
                                Registered: {new Date(selectedVendor.createdAt).toLocaleString("en-IN")}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-700 flex gap-3">
                            {(selectedVendor.status === "PENDING" || selectedVendor.status === "REJECTED") && (
                                <button
                                    onClick={() => { setShowDetailModal(false); handleApprove(selectedVendor._id); }}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                                >
                                    Approve
                                </button>
                            )}
                            {selectedVendor.status === "PENDING" && (
                                <button
                                    onClick={() => { setShowDetailModal(false); openRejectModal(selectedVendor); }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                                >
                                    Reject
                                </button>
                            )}
                            {selectedVendor.status === "APPROVED" && (
                                <button
                                    onClick={() => { handleResendEmail(selectedVendor._id); }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                                >
                                    Resend Email
                                </button>
                            )}
                            {selectedVendor.status === "APPROVED" && (
                                <button
                                    onClick={() => { setShowDetailModal(false); handleSuspend(selectedVendor._id); }}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                                >
                                    Suspend
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2.5 rounded-xl transition-all text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-lg font-bold text-white">Reject Vendor</h2>
                            <p className="text-gray-400 text-sm mt-1">Rejecting <strong className="text-white">{selectedVendor.businessName}</strong></p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rejection Reason</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Provide a reason for rejection..."
                                    className="w-full mt-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-700 flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={actionLoading === selectedVendor._id}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
                            >
                                {actionLoading === selectedVendor._id ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2.5 rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
