import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Search, Scan, X } from "lucide-react";
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
      setScanMessage(`✓ ${product.name} ditambahkan ke keranjang`);
      setTimeout(() => setScanMessage(""), 2000);
    } else {
      setScanMessage(`✗ Produk dengan barcode "${barcodeInput}" tidak ditemukan`);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kasir</h1>
        <p className="text-gray-500">Pilih produk dan proses penjualan</p>
      </div>

      {/* Price Type Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setPriceType("retail")}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
            priceType === "retail"
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
          }`}
        >
          <div className="text-lg">💳 Harga Eceran</div>
          <div className="text-xs opacity-80 mt-1">Untuk pembeli satuan</div>
        </button>
        <button
          onClick={() => setPriceType("wholesale")}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
            priceType === "wholesale"
              ? "bg-green-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
          }`}
        >
          <div className="text-lg">🏢 Harga Grosir</div>
          <div className="text-xs opacity-80 mt-1">Untuk pembeli grosir</div>
        </button>
      </div>

      {/* Barcode Scanner */}
      <form onSubmit={handleBarcodeSubmit} className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
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

      {/* Search Products */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-32">
        {filteredProducts.map((product) => {
          const retailPrice = product.priceRetail || product.price_retail || 0;
          const wholesalePrice = product.priceWholesale || product.price_wholesale || 0;
          const displayPrice = priceType === "retail" ? retailPrice : wholesalePrice;
          
          return (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-xl hover:border-blue-500 transition-all text-left"
            >
              <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2">Stok: {product.stock}</p>
              <p className="text-lg font-bold text-blue-600">
                Rp {displayPrice.toLocaleString("id-ID")}
              </p>
            </button>
          );
        })}
      </div>

      {/* Floating Checkout Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCheckout(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center gap-3"
          >
            <ShoppingCart className="w-6 h-6" />
            <div className="text-left">
              <div className="text-xs opacity-90">Keranjang ({cartCount} item)</div>
              <div className="text-lg font-bold">Rp {total.toLocaleString("id-ID")}</div>
            </div>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="mb-4 max-h-60 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x Rp {item.appliedPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-bold">
                    Rp {(item.quantity * item.appliedPrice).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Payment Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Jumlah Bayar</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
              />
              {parseFloat(paymentAmount) >= total && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Kembalian: <span className="font-bold">Rp {change.toLocaleString("id-ID")}</span>
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
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                >
                  {amount.toLocaleString("id-ID")}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={completeSale}
                disabled={parseFloat(paymentAmount) < total}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
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
