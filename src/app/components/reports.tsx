import { useState, useEffect } from "react";
import { Calendar, TrendingUp, DollarSign, ShoppingBag, Download } from "lucide-react";
import { Sale } from "../types";

interface ReportsProps {
  sales: Sale[];
}

type ReportPeriod = "harian" | "bulanan" | "tahunan";

interface ReportData {
  totalPenjualan: number;
  totalTransaksi: number;
  totalEceran: number;
  totalGrosir: number;
  rataRataTransaksi: number;
  produkTerlaris: { name: string; quantity: number }[];
}

export function Reports({ sales }: ReportsProps) {
  const [period, setPeriod] = useState<ReportPeriod>("harian");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    generateReport();
  }, [period, selectedDate, sales]);

  const filterSalesByPeriod = () => {
    const now = selectedDate;
    
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      
      if (period === "harian") {
        return (
          saleDate.getDate() === now.getDate() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (period === "bulanan") {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (period === "tahunan") {
        return saleDate.getFullYear() === now.getFullYear();
      }
      return false;
    });
  };

  const generateReport = () => {
    const filteredSales = filterSalesByPeriod();

    const totalPenjualan = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransaksi = filteredSales.length;
    const totalEceran = filteredSales
      .filter((s) => s.priceType === "retail")
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalGrosir = filteredSales
      .filter((s) => s.priceType === "wholesale")
      .reduce((sum, sale) => sum + sale.total, 0);
    const rataRataTransaksi = totalTransaksi > 0 ? totalPenjualan / totalTransaksi : 0;

    // Calculate best selling products
    const productCount: { [key: string]: number } = {};
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
      });
    });

    const produkTerlaris = Object.entries(productCount)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setReportData({
      totalPenjualan,
      totalTransaksi,
      totalEceran,
      totalGrosir,
      rataRataTransaksi,
      produkTerlaris,
    });
  };

  const getPeriodLabel = () => {
    if (period === "harian") {
      return selectedDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (period === "bulanan") {
      return selectedDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    } else {
      return selectedDate.getFullYear().toString();
    }
  };

  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    
    if (period === "harian") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (period === "bulanan") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (period === "tahunan") {
      newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  };

  const exportReport = () => {
    if (!reportData) return;

    const csvContent = `Laporan Penjualan - ${getPeriodLabel()}\n\n` +
      `Total Penjualan,Rp ${reportData.totalPenjualan.toLocaleString("id-ID")}\n` +
      `Total Transaksi,${reportData.totalTransaksi}\n` +
      `Penjualan Eceran,Rp ${reportData.totalEceran.toLocaleString("id-ID")}\n` +
      `Penjualan Grosir,Rp ${reportData.totalGrosir.toLocaleString("id-ID")}\n` +
      `Rata-rata per Transaksi,Rp ${Math.round(reportData.rataRataTransaksi).toLocaleString("id-ID")}\n\n` +
      `Produk Terlaris\n` +
      `Nama Produk,Jumlah Terjual\n` +
      reportData.produkTerlaris.map((p) => `${p.name},${p.quantity}`).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-${period}-${selectedDate.toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
          <p className="text-gray-500 mt-1">Analisis dan ringkasan penjualan toko</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Period buttons */}
          <div className="flex gap-2">
            {(["harian", "bulanan", "tahunan"] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setSelectedDate(new Date());
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Date navigator */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => changeDate("prev")}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg flex-1 justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">{getPeriodLabel()}</span>
            </div>
            <button
              onClick={() => changeDate("next")}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">
                  TOTAL
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                Rp {reportData.totalPenjualan.toLocaleString("id-ID")}
              </h3>
              <p className="text-blue-100 text-sm">Total Penjualan</p>
            </div>

            {/* Total Transactions */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <ShoppingBag className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">
                  TRANSAKSI
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{reportData.totalTransaksi}</h3>
              <p className="text-green-100 text-sm">Total Transaksi</p>
            </div>

            {/* Retail Sales */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">
                  ECERAN
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                Rp {reportData.totalEceran.toLocaleString("id-ID")}
              </h3>
              <p className="text-purple-100 text-sm">Penjualan Eceran</p>
            </div>

            {/* Wholesale Sales */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">
                  GROSIR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                Rp {reportData.totalGrosir.toLocaleString("id-ID")}
              </h3>
              <p className="text-orange-100 text-sm">Penjualan Grosir</p>
            </div>
          </div>

          {/* Average Transaction & Best Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Transaction */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Rata-rata per Transaksi</h3>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Rp {Math.round(reportData.rataRataTransaksi).toLocaleString("id-ID")}
                </div>
                <p className="text-gray-500">
                  Dari {reportData.totalTransaksi} transaksi
                </p>
              </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Produk Terlaris</h3>
              {reportData.produkTerlaris.length > 0 ? (
                <div className="space-y-3">
                  {reportData.produkTerlaris.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </div>
                      <span className="text-blue-600 font-bold">
                        {product.quantity} unit
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Tidak ada data penjualan</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
