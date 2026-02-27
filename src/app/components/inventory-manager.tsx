import { useState } from "react";
import { Plus, Edit2, Trash2, Package, AlertTriangle, Upload, Download } from "lucide-react";
import { Product } from "../types";
import { CSVImport } from "./csv-import";

interface InventoryManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onRefresh: () => void;
}

export function InventoryManager({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefresh,
}: InventoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    priceRetail: "",
    priceWholesale: "",
    priceModal: "",
    stock: "",
    barcode: "",
    category: "",
  });

  // Get unique categories from existing products
  const existingCategories = Array.from(new Set(products.map(p => p.category))).sort();

  const resetForm = () => {
    setFormData({
      name: "",
      priceRetail: "",
      priceWholesale: "",
      priceModal: "",
      stock: "",
      barcode: "",
      category: "",
    });
    setEditingId(null);
    setShowForm(false);
    setIsAddingNewCategory(false);
    setNewCategoryName("");
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__add_new__") {
      setIsAddingNewCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setIsAddingNewCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use newCategoryName if adding new category
    const finalCategory = isAddingNewCategory ? newCategoryName : formData.category;
    
    // Auto-generate SKU from category and timestamp
    const autoSKU = editingId 
      ? products.find(p => p.id === editingId)?.sku || `${finalCategory.substring(0, 3).toUpperCase()}-${Date.now()}`
      : `${finalCategory.substring(0, 3).toUpperCase()}-${Date.now()}`;
    
    const productData = {
      name: formData.name,
      priceRetail: parseFloat(formData.priceRetail),
      priceWholesale: parseFloat(formData.priceWholesale),
      priceModal: parseFloat(formData.priceModal) || 0,
      stock: parseInt(formData.stock),
      sku: autoSKU,
      barcode: formData.barcode || "",
      category: finalCategory,
      image: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop`,
    };

    if (editingId) {
      onUpdateProduct(editingId, productData);
    } else {
      onAddProduct(productData);
    }
    
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      priceRetail: (product.priceRetail || product.price_retail || 0).toString(),
      priceWholesale: (product.priceWholesale || product.price_wholesale || 0).toString(),
      priceModal: (product.priceModal || product.price_modal || 0).toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || "",
      category: product.category,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const lowStockProducts = products.filter((p) => p.stock < 10);

  const exportProductsToCSV = () => {
    const csvHeader = "name,sku,barcode,category,retail_price,wholesale_price,modal_price,stock,image_url\n";
    const csvContent = products
      .map((product) => {
        return `"${product.name}",${product.sku},${product.barcode || ""},${product.category},${product.priceRetail},${product.priceWholesale},${product.priceModal || 0},${product.stock},`;
      })
      .join("\n");

    const blob = new Blob([csvHeader + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `data-produk-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Manajemen Inventori</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola stok dan data produk</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportProductsToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#E05D43] text-white rounded-lg hover:bg-[#C54D33] font-medium"
            >
              <Download className="w-5 h-5" />
              Export Produk
            </button>
            <button
              onClick={() => setShowCSVImport(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-yellow-700">
            {lowStockProducts.length} product(s) have low stock levels (less than 10 units)
          </p>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Harga Eceran
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Harga Grosir
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    {product.barcode && (
                      <span className="text-xs text-gray-400">Barcode: {product.barcode}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-blue-600">
                  Rp {product.priceRetail.toLocaleString()}
                </td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  Rp {product.priceWholesale.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      product.stock < 10
                        ? "bg-red-100 text-red-700"
                        : product.stock < 20
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.stock} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                {!isAddingNewCategory ? (
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__add_new__">+ Tambah Kategori Baru</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan nama kategori baru"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryName("");
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      ← Kembali ke pilihan kategori
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga Eceran (Retail)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.priceRetail}
                    onChange={(e) => setFormData({ ...formData, priceRetail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga Grosir (Wholesale)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.priceWholesale}
                    onChange={(e) => setFormData({ ...formData, priceWholesale: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Harga Modal (Cost)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.priceModal}
                  onChange={(e) => setFormData({ ...formData, priceModal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rp (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Harga modal/pokok produk (opsional)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Stock</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Barcode (optional)</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789012"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingId ? "Update" : "Add"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVImport && (
        <CSVImport
          onClose={() => setShowCSVImport(false)}
          onSuccess={() => {
            setShowCSVImport(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}