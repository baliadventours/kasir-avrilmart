import { useState, useEffect } from "react";
import { Store, Package, BarChart3, Users, LogOut } from "lucide-react";
import { POSInterface } from "./components/pos-interface";
import { InventoryManager } from "./components/inventory-manager";
import { SalesHistory } from "./components/sales-history";
import { Login } from "./components/login";
import { UserManagement } from "./components/user-management";
import { Product, CartItem, Sale } from "./types";
import { productsAPI, salesAPI, authAPI } from "../services/supabase";
import { dbToFrontendProduct, frontendToDbProduct } from "../utils/helpers";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "admin" | "cashier";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "sales" | "users">("pos");
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load products when user logs in
  useEffect(() => {
    if (user) {
      loadProducts();
      loadSales();
    }
  }, [user]);

  const checkSession = async () => {
    try {
      const session = await authAPI.getSession();

      if (session) {
        const user = await authAPI.getUser();
        if (user) {
          setAccessToken(session.access_token);
          setUser({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || "",
            role: user.user_metadata?.role || "cashier",
          });
        }
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const { session, user: authUser } = await authAPI.signIn(email, password);

      if (session && authUser) {
        setAccessToken(session.access_token);
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata?.name || "",
          role: authUser.user_metadata?.role || "cashier",
        });
        setActiveTab("pos");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Terjadi kesalahan saat login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
      setAccessToken(null);
      setProducts([]);
      setSales([]);
      setActiveTab("pos");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const dbProducts = await productsAPI.getAll();
      const frontendProducts = dbProducts.map(dbToFrontendProduct);
      setProducts(frontendProducts);
      setError(null);
    } catch (error: any) {
      console.error("Error loading products:", error);
      setError("Gagal memuat produk: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const dbSales = await salesAPI.getAll();
      
      // Convert to frontend format
      const frontendSales: Sale[] = await Promise.all(
        dbSales.map(async (sale) => {
          const { items } = await salesAPI.getWithItems(sale.id);
          
          const cartItems: CartItem[] = items.map((item) => ({
            id: item.product_id,
            name: item.product_name,
            sku: item.product_sku,
            priceRetail: item.price,
            priceWholesale: item.price,
            price_retail: item.price,
            price_wholesale: item.price,
            stock: 0,
            category: "",
            quantity: item.quantity,
            priceType: sale.price_type,
            appliedPrice: item.price,
          }));

          return {
            id: sale.id,
            date: sale.created_at,
            items: cartItems,
            total: sale.total,
            priceType: sale.price_type,
          };
        })
      );

      setSales(frontendSales);
    } catch (error: any) {
      console.error("Error loading sales:", error);
      // Don't show error for sales loading - not critical
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      setLoading(true);
      const dbProduct = frontendToDbProduct(product);
      const newProduct = await productsAPI.create(dbProduct);
      const frontendProduct = dbToFrontendProduct(newProduct);
      setProducts([...products, frontendProduct]);
      setError(null);
    } catch (error: any) {
      console.error("Error adding product:", error);
      setError("Gagal menambah produk: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setLoading(true);
      const dbUpdates = frontendToDbProduct(updates);
      const updatedProduct = await productsAPI.update(id, dbUpdates);
      const frontendProduct = dbToFrontendProduct(updatedProduct);
      setProducts(products.map((p) => (p.id === id ? frontendProduct : p)));
      setError(null);
    } catch (error: any) {
      console.error("Error updating product:", error);
      setError("Gagal update produk: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await productsAPI.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      setError(null);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setError("Gagal hapus produk: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSale = async (
    items: CartItem[],
    total: number,
    priceType: "retail" | "wholesale",
    paymentAmount?: number
  ) => {
    if (!user) return;

    try {
      setLoading(true);

      // Prepare sale items for database
      const saleItems = items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_sku: item.sku,
        quantity: item.quantity,
        price: item.appliedPrice,
      }));

      // Create sale in database
      const { sale } = await salesAPI.create(user.id, saleItems, priceType, paymentAmount);

      // Reload products to get updated stock
      await loadProducts();

      // Add to local sales state
      const newSale: Sale = {
        id: sale.id,
        date: sale.created_at,
        items,
        total: sale.total,
        priceType: sale.price_type,
      };
      setSales([newSale, ...sales]);

      setError(null);
    } catch (error: any) {
      console.error("Error processing sale:", error);
      setError("Gagal proses penjualan: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} error={loginError} loading={loginLoading} />;
  }

  // Check permissions for tabs
  const canAccessInventory = user.role === "admin";
  const canAccessSales = user.role === "admin";
  const canAccessUsers = user.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">POS & Inventory</h1>
                <p className="text-sm text-gray-500">Point of Sale Management System</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === "admin" ? "Administrator" : "Kasir"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-1 px-6">
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === "pos"
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Store className="w-5 h-5" />
            Point of Sale
          </button>

          {canAccessInventory && (
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === "inventory"
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="w-5 h-5" />
              Inventory
            </button>
          )}

          {canAccessSales && (
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === "sales"
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Sales History
            </button>
          )}

          {canAccessUsers && (
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-5 h-5" />
              Users
            </button>
          )}
        </nav>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-3 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6">
        {loading && (
          <div className="fixed top-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Loading...
          </div>
        )}

        {activeTab === "pos" && <POSInterface products={products} onSale={handleSale} />}
        {activeTab === "inventory" && canAccessInventory && (
          <InventoryManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRefresh={loadProducts}
          />
        )}
        {activeTab === "sales" && canAccessSales && <SalesHistory sales={sales} />}
        {activeTab === "users" && canAccessUsers && (
          <UserManagement accessToken={accessToken || ""} />
        )}
      </main>
    </div>
  );
}