import { Receipt, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { Sale } from "../types";

interface SalesHistoryProps {
  sales: Sale[];
}

export function SalesHistory({ sales }: SalesHistoryProps) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const today = new Date().toDateString();
  const todaySales = sales.filter((sale) => new Date(sale.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sales History</h2>
        <p className="text-gray-500">Track your sales and revenue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">Rp {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Today's Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-900">Rp {todayRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{sales.length}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Items Sold</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{totalItems}</p>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Price Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No sales yet
                  </td>
                </tr>
              ) : (
                sales
                  .slice()
                  .reverse()
                  .map((sale) => {
                    const totalQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(sale.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            sale.priceType === "retail" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-green-100 text-green-700"
                          }`}>
                            {sale.priceType === "retail" ? "Eceran" : "Grosir"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.name} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {totalQty} items
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          Rp {sale.total.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}