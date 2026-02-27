import { useState, useEffect } from "react";
import { POSInterface } from "./components/pos-interface";
import { InventoryManager } from "./components/inventory-manager";
import { SalesHistory } from "./components/sales-history";
import { Login } from "./components/login";
import { UserManagement } from "./components/user-management";
import { CategoryManager } from "./components/category-manager";
import { Sidebar } from "./components/sidebar";
import { Reports } from "./components/reports";
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
  const [activeMenu, setActiveMenu] = useState<"pos" | "inventory" | "sales" | "reports" | "users" | "categories">("pos");
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        setActiveMenu("pos");
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
      setActiveMenu("pos");
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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={(menu) => setActiveMenu(menu as any)}
        userRole={user.role}
        userName={user.name}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}>
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-3 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-900 font-bold hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            Memuat...
          </div>
        )}

        {/* Main Content Area */}
        <main className="pt-6 bg-gray-50 min-h-screen">
          {activeMenu === "pos" && <POSInterface products={products} onSale={handleSale} />}
          {activeMenu === "inventory" && canAccessInventory && (
            <InventoryManager
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onRefresh={loadProducts}
            />
          )}
          {activeMenu === "sales" && canAccessSales && <SalesHistory sales={sales} />}
          {activeMenu === "reports" && canAccessSales && <Reports sales={sales} />}
          {activeMenu === "users" && canAccessUsers && (
            <UserManagement accessToken={accessToken || ""} />
          )}
          {activeMenu === "categories" && <CategoryManager />}
        </main>
      </div>
    </div>
  );
}