import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Search, X, Scan, Menu, CreditCard, Grid3x3, List } from "lucide-react";
import { Product, CartItem, AppSettings } from "../types";
import { ThermalReceipt } from "./thermal-receipt";
import { toast } from "sonner";
import { ProductCard, ProductGridCard } from "./product-card-lazy";

// 🔥 Custom Placeholder Image
const placeholderImage = "https://i.ibb.co.com/GvsmxH9Y/avrilmart-app-icon.png";

// 🔥 PERFORMA OPTIMIZATION: Limit produk yang di-render (default 100, bisa lebih jika search)
const MAX_PRODUCTS_TO_RENDER = 100;

interface POSInterfaceProps {
  products: Product[];
  settings?: AppSettings | null;
  onSale: (
    items: CartItem[], 
    total: number, 
    priceType: "retail" | "wholesale", 
    paymentAmount?: number,
    paymentMethod?: "cash" | "credit_card" | "debit_card" | "qris" | "transfer"
  ) => void;
}

export function POSInterface({ products, settings, onSale }: POSInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit_card" | "debit_card" | "qris" | "transfer">(
    settings?.default_payment_method || "cash"
  );
  const [priceType, setPriceType] = useState<"retail" | "wholesale">("retail");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lastSale, setLastSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // 🔥 NEW: View mode toggle
  const [displayLimit, setDisplayLimit] = useState(MAX_PRODUCTS_TO_RENDER); // 🔥 NEW: Pagination limit
  const cartEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of cart when items are added
  useEffect(() => {
    cartEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cart]);

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

  // 🔥 NEW: Limit displayed products untuk performa
  const displayedProducts = filteredProducts.slice(0, displayLimit);
  const hasMore = filteredProducts.length > displayLimit;
  const remainingProducts = filteredProducts.length - displayLimit;

  const subtotal = cart.reduce((sum, item) => sum + item.appliedPrice * item.quantity, 0);
  const discount = 0;
  const total = subtotal - discount;
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

  // 🔥 NEW: Handle barcode scan (auto-add to cart on Enter)
  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Search by barcode or SKU
      const product = products.find((p) => 
        p.barcode?.toLowerCase() === searchTerm.toLowerCase() ||
        p.sku.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (product && product.stock > 0) {
        // Auto-add to cart
        addToCart(product);
        // Clear search
        setSearchTerm('');
        // Show success feedback (optional)
        toast.success(`Produk ditambahkan: ${product.name}`);
      } else if (product && product.stock === 0) {
        toast.error(`Stok habis untuk produk: ${product.name}`);
        setSearchTerm('');
      } else {
        toast.error(`Produk tidak ditemukan: ${searchTerm}`);
        setSearchTerm('');
      }
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

  // 🔥 NEW: Reset pagination saat search atau kategori berubah
  useEffect(() => {
    setDisplayLimit(MAX_PRODUCTS_TO_RENDER);
  }, [searchTerm, selectedCategory]);

  const completeSale = () => {
    const payment = parseFloat(paymentAmount);
    if (payment >= total) {
      const saleData = {
        id: Date.now().toString(),
        total: total,
        payment_type: priceType,
        payment_amount: payment,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        items: cart.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.appliedPrice,
          total: item.appliedPrice * item.quantity
        }))
      };

      onSale(cart, total, priceType, payment, paymentMethod);
      setLastSale(saleData);
      setCart([]);
      setShowCheckout(false);
      setPaymentAmount("");
      setShowReceipt(true);
    }
  };

  const change = parseFloat(paymentAmount) - total;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Main Content - Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section - Fixed at Top */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 pb-3">
          {/* Category Button & Selected Category */}
          <div className="flex items-center gap-3 mb-3 pt-4">
            <button
              onClick={() => setShowCategoryMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E05D43] text-white rounded-lg hover:bg-[#C54D33] transition-all font-medium"
            >
              <Menu className="w-4 h-4" />
              <span>Kategori</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg flex-1">
              <span className="text-sm text-gray-500">Kategori:</span>
              <span className="text-sm font-medium text-gray-900">{selectedCategory}</span>
            </div>
            {/* 🔥 NEW: View Toggle Buttons */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white text-[#E05D43] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-[#E05D43] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Produk/Scan Barcode"
              className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E05D43] focus:border-transparent"
              onKeyDown={handleBarcodeSearch}
            />
            <Scan className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* 🔥 NEW: Product Counter */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Menampilkan {displayedProducts.length} dari {filteredProducts.length} produk
          </div>
        </div>

        {/* Products List - Scrollable with Bottom Padding */}
        <div className="flex-1 overflow-y-auto px-6" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {/* 🔥 LIST VIEW */}
          {viewMode === "list" && (
            <div className="space-y-1.5 pt-4 pb-6">
              {displayedProducts.map((product) => {
                const retailPrice = product.priceRetail || product.price_retail || 0;
                const wholesalePrice = product.priceWholesale || product.price_wholesale || 0;
                const displayPrice = priceType === "retail" ? retailPrice : wholesalePrice;
                
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full bg-white rounded-lg px-3 py-2 hover:bg-gray-50 hover:border-[#E05D43] transition-all text-left border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                          {product.category}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[#E05D43]">
                          Rp {displayPrice.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {hasMore && (
                <button
                  onClick={() => setDisplayLimit(displayLimit + MAX_PRODUCTS_TO_RENDER)}
                  className="w-full bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-gray-100 hover:border-[#E05D43] transition-all text-center border border-gray-200"
                >
                  <h3 className="font-semibold text-sm text-gray-900">
                    Tampilkan {remainingProducts} produk lagi
                  </h3>
                </button>
              )}
            </div>
          )}

          {/* 🔥 GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 pb-6">
              {displayedProducts.map((product) => {
                const retailPrice = product.priceRetail || product.price_retail || 0;
                const wholesalePrice = product.priceWholesale || product.price_wholesale || 0;
                const displayPrice = priceType === "retail" ? retailPrice : wholesalePrice;
                
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white rounded-lg p-3 hover:shadow-md hover:border-[#E05D43] transition-all text-left border border-gray-200 flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={product.image || placeholderImage}
                        alt={product.name}
                        loading="lazy"
                        className={`w-full h-full object-contain ${
                          !product.image || product.image === placeholderImage 
                            ? 'grayscale opacity-40' 
                            : 'object-cover'
                        }`}
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      <div>
                        <div className="text-sm font-bold text-[#E05D43]">
                          Rp {displayPrice.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {hasMore && (
                <button
                  onClick={() => setDisplayLimit(displayLimit + MAX_PRODUCTS_TO_RENDER)}
                  className="bg-white rounded-lg p-3 hover:shadow-md hover:border-[#E05D43] transition-all text-center border border-gray-200 flex flex-col"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden p-2">
                    <img
                      src={placeholderImage}
                      alt="Load More"
                      loading="lazy"
                      className="w-full h-full object-contain grayscale opacity-40"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 flex items-center justify-center">
                    <h3 className="font-semibold text-sm text-gray-900">
                      Tampilkan {remainingProducts} produk lagi
                    </h3>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Order Aktif - More Padding */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Order Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Aktif</h2>
            <div className="bg-[#E05D43] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
              {cartCount}
            </div>
          </div>
          
          {/* Price Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPriceType("retail")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                priceType === "retail"
                  ? "bg-[#E05D43] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Eceran
            </button>
            <button
              onClick={() => setPriceType("wholesale")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                priceType === "wholesale"
                  ? "bg-[#E05D43] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Grosir
            </button>
          </div>
        </div>

        {/* Cart Items - Fixed Height */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada item</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded p-2 border border-gray-100 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-gray-900 leading-tight truncate pr-2 flex-1">{item.name}</h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-0.5">
                    <div className="flex items-center bg-white rounded border border-gray-200 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900">
                        Rp {(item.quantity * item.appliedPrice).toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Rp {item.appliedPrice.toLocaleString("id-ID")}/pc
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={cartEndRef} />
            </div>
          )}
        </div>

        {/* Order Summary - Fixed at Bottom */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Diskon</span>
                <span>-Rp {discount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Hapus Semua
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="flex-1 py-2.5 rounded-lg bg-[#E05D43] text-white text-sm font-medium hover:bg-[#C54D33] transition-all"
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
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-xl text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
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

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Metode Pembayaran</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === "cash"
                      ? "bg-[#E05D43] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tunai
                </button>
                <button
                  onClick={() => setPaymentMethod("credit_card")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === "credit_card"
                      ? "bg-[#E05D43] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Kartu Kredit
                </button>
                <button
                  onClick={() => setPaymentMethod("debit_card")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === "debit_card"
                      ? "bg-[#E05D43] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Kartu Debit
                </button>
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === "qris"
                      ? "bg-[#E05D43] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === "transfer"
                      ? "bg-[#E05D43] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Transfer
                </button>
              </div>
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
                className="flex-1 px-4 py-3 bg-[#E05D43] text-white rounded-xl hover:bg-[#C54D33] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
          settings={settings}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Category Menu Modal */}
      {showCategoryMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pilih Kategori</h2>
              <button
                onClick={() => setShowCategoryMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const categoryProducts = category === "All" 
                    ? availableProducts 
                    : availableProducts.filter((p) => p.category === category);
                  const productCount = categoryProducts.length;

                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryMenu(false);
                      }}
                      className={`p-4 rounded-xl text-left border-2 transition-all ${
                        selectedCategory === category
                          ? "bg-[#E05D43] text-white border-[#E05D43]"
                          : "bg-white text-gray-900 border-gray-200 hover:border-[#E05D43] hover:bg-orange-50"
                      }`}
                    >
                      <div className="font-semibold text-base mb-1 truncate">{category}</div>
                      <div className={`text-sm ${selectedCategory === category ? 'text-white/80' : 'text-gray-500'}`}>
                        {productCount} produk
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCategoryMenu(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}