import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Search, Scan, X } from "lucide-react";
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
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [lastSale, setLastSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const availableProducts = products.filter((p) => p.stock > 0);
  const filteredProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.appliedPrice * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (barcodeInputRef.current && !showCheckout) {
      barcodeInputRef.current.focus();
    }
  }, [showCheckout]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find((p) => 
      p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() && p.stock > 0
    );

    if (product) {
      addToCart(product);
      setScanMessage(`✓ ${product.name} ditambahkan`);
      setTimeout(() => setScanMessage(""), 2000);
    } else {
      setScanMessage(`✗ Produk tidak ditemukan`);
      setTimeout(() => setScanMessage(""), 3000);
    }

    setBarcodeInput("");
  };

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
    <div className="flex h-screen bg-gray-50">
      {/* Main Content - Products */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Kasir</h1>
          <p className="text-sm text-gray-500">Pilih produk dan proses penjualan</p>
        </div>

        {/* Price Type Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPriceType("retail")}
            className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              priceType === "retail"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Harga Eceran
          </button>
          <button
            onClick={() => setPriceType("wholesale")}
            className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              priceType === "wholesale"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Harga Grosir
          </button>
        </div>

        {/* Barcode Scanner */}
        <form onSubmit={handleBarcodeSubmit} className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Scan className="w-4 h-4 inline mr-2" />
              Scan Barcode / SKU
            </label>
            <div className="flex gap-2">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan atau ketik barcode..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Tambah
              </button>
            </div>
            {scanMessage && (
              <p className={`mt-2 text-sm ${scanMessage.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
                {scanMessage}
              </p>
            )}
          </div>
        </form>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const retailPrice = product.priceRetail || product.price_retail || 0;
            const wholesalePrice = product.priceWholesale || product.price_wholesale || 0;
            const displayPrice = priceType === "retail" ? retailPrice : wholesalePrice;
            
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-900 hover:shadow-md transition-all text-left"
              >
                <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm mb-1 truncate text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">Stok: {product.stock}</p>
                <p className="text-base font-medium text-gray-900">
                  Rp {displayPrice.toLocaleString("id-ID")}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Cart - Sticky */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Keranjang</h2>
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
              {cartCount}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Keranjang masih kosong</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Rp {item.appliedPrice.toLocaleString("id-ID")} / unit
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-medium text-gray-900">
                      Rp {(item.quantity * item.appliedPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 font-medium"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-900">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Totals Summary */}
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-medium"
              />
              {parseFloat(paymentAmount) >= total && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Kembalian: <span className="font-medium">Rp {change.toLocaleString("id-ID")}</span>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-900"
                >
                  {(amount / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                onClick={completeSale}
                disabled={parseFloat(paymentAmount) < total}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
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
