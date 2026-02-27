import { useState } from "react";
import { UserPlus, Users, Shield, User } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface UserManagementProps {
  accessToken: string;
}

export function UserManagement({ accessToken }: UserManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier" as "admin" | "cashier",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b5055851/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Use accessToken instead of publicAnonKey
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: `User ${formData.name} berhasil dibuat!` });
        setFormData({ name: "", email: "", password: "", role: "cashier" });
        setShowForm(false);
      } else {
        setMessage({ type: "error", text: data.error || "Gagal membuat user" });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat membuat user" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Kelola akses kasir dan administrator</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#E05D43] text-white px-4 py-2 rounded-lg hover:bg-[#C54D33] flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Tambah User
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Administrator</h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Akses penuh ke semua fitur</li>
            <li>• Kelola inventory dan produk</li>
            <li>• Lihat sales history dan laporan</li>
            <li>• Kelola user kasir</li>
            <li>• Akses Point of Sale</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-bold text-green-900">Kasir</h3>
          </div>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• Akses Point of Sale</li>
            <li>• Proses transaksi penjualan</li>
            <li>• Scan barcode produk</li>
            <li>• Lihat stok produk</li>
            <li>• Tidak bisa edit inventory</li>
          </ul>
        </div>
      </div>

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Tambah User Baru</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as "admin" | "cashier" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cashier">Kasir</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", email: "", password: "", role: "cashier" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Tambah User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}