import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Search, X, Scan } from "lucide-react";
import { Product, CartItem } from "../types";
import { ThermalReceipt } from "./thermal-receipt";

interface POSInterfaceProps {
  products: Product[];
  onSale: (items: CartItem[], total: number, priceType: "retail" | "wholesale", paymentAmount?: number) => void;
}

export function POSInterface({ products, onSale }: POSInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [priceType, setPriceType] = useState<"retail" | "wholesale">("retail");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lastSale, setLastSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const availableProducts = products.filter((p) => p.stock > 0);
  
  // Get unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  
  const filteredProducts = availableProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.appliedPrice * item.quantity, 0);
  const discount = 0;
  const tax = subtotal * 0.1;
  const total = subtotal - discount + tax;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const appliedPrice = priceType === "retail" 
      ? (product.priceRetail || product.price_retail || 0)
      : (product.priceWholesale || product.price_wholesale || 0);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      }
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1, 
        priceType,
        appliedPrice 
      }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
    } else if (newQuantity <= product.stock) {
      setCart(
        cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeSale = () => {
    const payment = parseFloat(paymentAmount);
    if (payment >= total) {
      const saleData = {
        id: Date.now().toString(),
        total: total,
        payment_type: priceType,
        created_at: new Date().toISOString(),
        items: cart.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.appliedPrice,
          total: item.appliedPrice * item.quantity
        }))
      };

      onSale(cart, total, priceType, payment);
      setLastSale(saleData);
      setCart([]);
      setShowCheckout(false);
      setPaymentAmount("");
      setShowReceipt(true);
    }
  };

  const change = parseFloat(paymentAmount) - total;

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Main Content - Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section - Same Background */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 pt-6 px-6 pb-4">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-[#E05D43] text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Produk/Scan Barcode"
              className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05D43] focus:border-transparent shadow-sm"
            />
            <Scan className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 bg-gradient-to-br from-orange-50 via-white to-pink-50">
          <div className="space-y-2">
            {filteredProducts.map((product) => {
              const retailPrice = product.priceRetail || product.price_retail || 0;
              const wholesalePrice = product.priceWholesale || product.price_wholesale || 0;
              const displayPrice = priceType === "retail" ? retailPrice : wholesalePrice;
              
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full bg-white rounded-lg p-4 hover:shadow-md hover:border-[#E05D43] transition-all text-left border border-gray-100 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>SKU: {product.sku}</span>
                        {product.barcode && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Scan className="w-3 h-3" />
                              {product.barcode}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-[#E05D43]">
                        Rp {displayPrice.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {product.category}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar - Order Aktif */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0 shadow-xl">
        {/* Order Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order Aktif</h2>
            <div className="bg-[#E05D43] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              {cartCount}
            </div>
          </div>
          
          {/* Price Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPriceType("retail")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                priceType === "retail"
                  ? "bg-[#E05D43] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Eceran
            </button>
            <button
              onClick={() => setPriceType("wholesale")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                priceType === "wholesale"
                  ? "bg-[#E05D43] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Grosir
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Belum ada item</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        Rp {item.appliedPrice.toLocaleString("id-ID")} × {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">
                      Rp {(item.quantity * item.appliedPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Diskon</span>
                <span>- Rp {discount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Hapus Semua
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E05D43] to-[#FF6B4A] text-white font-medium hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                Bayar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pembayaran</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Totals Summary */}
            <div className="space-y-2 mb-6 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Payment Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Jumlah Bayar</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05D43] focus:border-transparent text-lg font-medium"
              />
              {parseFloat(paymentAmount) >= total && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700">
                    Kembalian: <span className="font-semibold">Rp {change.toLocaleString("id-ID")}</span>
                  </p>
                </div>
              )}
              {parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) < total && (
                <p className="mt-2 text-sm text-red-600">
                  Jumlah bayar kurang dari total
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[50000, 100000, 200000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setPaymentAmount(amount.toString())}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-[#E05D43] hover:text-[#E05D43] transition-colors"
                >
                  {(amount / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                onClick={completeSale}
                disabled={parseFloat(paymentAmount) < total}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E05D43] to-[#FF6B4A] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt */}
      {showReceipt && lastSale && (
        <ThermalReceipt
          sale={lastSale}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
