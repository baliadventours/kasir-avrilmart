import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Scan } from "lucide-react";
import { Product, CartItem } from "../types";

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
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const availableProducts = products.filter((p) => p.stock > 0);
  const filteredProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.appliedPrice * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Auto-focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current && !showCheckout) {
      barcodeInputRef.current.focus();
    }
  }, [showCheckout]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Search for product by SKU (barcode)
    const product = products.find((p) => 
      p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() && p.stock > 0
    );

    if (product) {
      addToCart(product);
      setScanMessage(`✓ ${product.name} ditambahkan ke cart`);
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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const completeSale = () => {
    const payment = parseFloat(paymentAmount);
    if (payment >= total) {
      onSale(cart, total, priceType, payment);
      setCart([]);
      setShowCheckout(false);
      setPaymentAmount("");
    }
  };

  const change = parseFloat(paymentAmount) - total;

  return (
    <div className="flex gap-6 h-full">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4 space-y-3">
          {/* Price Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPriceType("retail")}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                priceType === "retail"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Harga Eceran
            </button>
            <button
              onClick={() => setPriceType("wholesale")}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                priceType === "wholesale"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Harga Grosir
            </button>
          </div>

          {/* Barcode Scanner Input */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan barcode atau ketik SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-blue-50"
            />
            {scanMessage && (
              <div className={`absolute top-full mt-2 w-full px-4 py-2 rounded-lg text-sm font-semibold ${
                scanMessage.startsWith("✓") 
                  ? "bg-green-100 text-green-700 border border-green-300" 
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}>
                {scanMessage}
              </div>
            )}
          </form>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const retailPrice = product.priceRetail || product.price_retail || 0;
              const wholesalePrice = product.priceWholesale || product.price_wholesale || 0;
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow text-left"
                >
                  <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Stock: {product.stock}</p>
                  <div className="space-y-1">
                    <p className={`text-lg font-bold ${priceType === "retail" ? "text-blue-600" : "text-gray-400 line-through text-sm"}`}>
                      Rp {retailPrice.toLocaleString()}
                    </p>
                    <p className={`text-lg font-bold ${priceType === "wholesale" ? "text-green-600" : "text-gray-400 text-sm"}`}>
                      Rp {wholesalePrice.toLocaleString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white border border-gray-200 rounded-lg p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-6 h-6" />
          <h2 className="text-xl font-bold">Cart</h2>
          <span className="ml-auto bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        {/* Price Type Badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            priceType === "retail" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
          }`}>
            {priceType === "retail" ? "Harga Eceran" : "Harga Grosir"}
          </span>
        </div>

        <div className="flex-1 overflow-auto mb-4">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{item.name}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Rp {item.appliedPrice.toLocaleString()} / unit
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold">
                      Rp {(item.appliedPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (10%):</span>
            <span>Rp {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Checkout
        </button>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-lg mb-4">
                <span>Total Amount:</span>
                <span className="font-bold text-2xl">Rp {total.toLocaleString()}</span>
              </div>
              
              <label className="block text-sm font-semibold mb-2">Payment Amount:</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">Rp</span>
                <input
                  type="number"
                  step="1000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                  autoFocus
                />
              </div>
              
              {paymentAmount && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  {change >= 0 ? (
                    <>
                      <div className="flex justify-between text-lg">
                        <span>Change:</span>
                        <span className="font-bold text-green-600">
                          Rp {change.toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">Insufficient payment</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setPaymentAmount("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={completeSale}
                disabled={!paymentAmount || parseFloat(paymentAmount) < total}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}