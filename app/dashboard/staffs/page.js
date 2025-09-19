"use client";

import { useEffect, useState } from "react";

export default function StaffsPage() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    designation: "", 
    advance: 0,
    monthlySalary: 0,
    setCommission: false,
    commissionPercent: 0,
    commissionBillThreshold: 0,
    dateOfJoining: "",
    address: "",
  });

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchStaffs = async (p = 1, s = "") => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(p), limit: "10", ...(s && { search: s }) });
      const res = await fetch(`${baseURL}/api/staff?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load staff");
      setStaffs(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStaffs(1, search);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const url = editingStaff ? `${baseURL}/api/staff/${editingStaff._id}` : `${baseURL}/api/staff`;
      const method = editingStaff ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          advance: Number(form.advance) || 0,
          monthlySalary: Number(form.monthlySalary) || 0,
          commissionPercent: Number(form.commissionPercent) || 0,
          commissionBillThreshold: Number(form.commissionBillThreshold) || 0,
          dateOfJoining: form.dateOfJoining ? new Date(form.dateOfJoining) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to ${editingStaff ? 'update' : 'add'} staff`);
      
      // Refresh list
      setIsAdding(false);
      setEditingStaff(null);
      setForm({
        name: "",
        phone: "",
        gender: "",
        designation: "",
        advance: 0,
        monthlySalary: 0,
        setCommission: false,
        commissionPercent: 0,
        commissionBillThreshold: 0,
        dateOfJoining: "",
        address: "",
      });
      fetchStaffs(page, search);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name || "",
      phone: staff.phone || "",
      gender: staff.gender || "",
      designation: staff.designation || "",
      advance: staff.advance || 0,
      monthlySalary: staff.monthlySalary || 0,
      setCommission: staff.setCommission || false,
      commissionPercent: staff.commissionPercent || 0,
      commissionBillThreshold: staff.commissionBillThreshold || 0,
      dateOfJoining: staff.dateOfJoining ? new Date(staff.dateOfJoining).toISOString().split('T')[0] : "",
      address: staff.address || "",
    });
    setIsAdding(true);
  };

  const handleDelete = async (staffId) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${baseURL}/api/staff/${staffId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete staff");
      
      fetchStaffs(page, search);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingStaff(null);
    setForm({
      name: "",
      phone: "",
      gender: "",
      designation: "",
      advance: 0,
      monthlySalary: 0,
      setCommission: false,
      commissionPercent: 0,
      commissionBillThreshold: 0,
      dateOfJoining: "",
      address: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staffs</h1>
          <p className="text-gray-300 text-sm">Manage staff records and commissions</p>
        </div>
        <button
          onClick={() => setIsAdding((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isAdding ? "Close" : "Add Staff"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editingStaff ? "Edit Staff" : "New Staff"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                <option value="">Please Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Designation</label>
              <input name="designation" value={form.designation} onChange={handleChange} placeholder="Please Select" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Advance</label>
              <input type="number" step="0.01" name="advance" value={form.advance} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Monthly Salary</label>
              <input type="number" step="0.01" name="monthlySalary" value={form.monthlySalary} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 text-gray-300 text-sm">
                <input type="checkbox" name="setCommission" checked={form.setCommission} onChange={handleChange} className="h-4 w-4" />
                Set Commission
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Commission (%)</label>
              <input type="number" step="0.01" name="commissionPercent" value={form.commissionPercent} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">When Bill Amount &gt; than</label>
              <input type="number" step="0.01" name="commissionBillThreshold" value={form.commissionBillThreshold} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Date of Joining</label>
              <input type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200">Cancel</button>
              <button type="submit" disabled={submitting} className={`px-4 py-2 rounded-lg text-white ${submitting ? "bg-blue-500/70" : "bg-blue-600 hover:bg-blue-700"}`}>
                {submitting ? (editingStaff ? "Updating..." : "Saving...") : (editingStaff ? "Update" : "Save")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
          <h2 className="text-white font-semibold">All Staffs</h2>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              placeholder="Search by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white w-56"
            />
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600">Search</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commission</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-300">Loading...</td>
                </tr>
              ) : staffs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-300">No staff found</td>
                </tr>
              ) : (
                staffs.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-gray-200 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-300">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-300">{s.designation || "-"}</td>
                    <td className="px-4 py-3 text-gray-300">₹{Number(s.monthlySalary || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {s.setCommission ? `${s.commissionPercent || 0}% > ₹${Number(s.commissionBillThreshold || 0).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {s.dateOfJoining ? new Date(s.dateOfJoining).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-300">
            <span>
              Page <span className="text-white font-semibold">{page}</span> of <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-600 rounded-lg bg-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-600 rounded-lg bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


