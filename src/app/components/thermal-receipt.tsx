import { X, Printer } from "lucide-react";

interface ThermalReceiptProps {
  sale: {
    id: string;
    total: number;
    payment_type: "retail" | "wholesale";
    created_at: string;
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
  };
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  onClose: () => void;
}

export function ThermalReceipt({
  sale,
  storeName = "AVRIL MART",
  storeAddress = "Kintamani - Bali",
  storePhone = "0812-3456-7890",
  onClose,
}: ThermalReceiptProps) {
  const subtotal = sale.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = sale.total;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Modal Overlay - Hidden when printing */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-900">Struk Pembayaran</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview of thermal receipt */}
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="text-xs font-mono text-center space-y-1">
              <div className="font-bold text-sm">{storeName}</div>
              <div>{storeAddress}</div>
              <div>Telp: {storePhone}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Thermal Receipt - Only visible when printing */}
      <div className="hidden print:block print:absolute print:inset-0 print:bg-white">
        <style>
          {`
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              body * {
                visibility: hidden;
              }
              .print-receipt, .print-receipt * {
                visibility: visible;
              }
              .print-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
              }
            }
          `}
        </style>

        <div
          className="print-receipt"
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            padding: "10mm 5mm",
            margin: "0 auto",
          }}
        >
          {/* Store Header */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{storeName}</div>
            <div style={{ fontSize: "11px", marginTop: "3px" }}>{storeAddress}</div>
            <div style={{ fontSize: "11px" }}>Telp: {storePhone}</div>
          </div>

          {/* Separator */}
          <div
            style={{
              borderTop: "1px dashed #000",
              margin: "10px 0",
            }}
          />

          {/* Transaction Info */}
          <div style={{ fontSize: "11px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tanggal</span>
              <span>
                {new Date(sale.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Waktu</span>
              <span>
                {new Date(sale.created_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>No. Transaksi</span>
              <span>{sale.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tipe</span>
              <span>{sale.payment_type === "retail" ? "Eceran" : "Grosir"}</span>
            </div>
          </div>

          {/* Separator */}
          <div
            style={{
              borderTop: "1px dashed #000",
              margin: "10px 0",
            }}
          />

          {/* Items */}
          <div style={{ marginBottom: "10px" }}>
            {sale.items.map((item, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: "bold" }}>{item.product_name}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                  }}
                >
                  <span>
                    {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                  </span>
                  <span>Rp {item.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div
            style={{
              borderTop: "1px dashed #000",
              margin: "10px 0",
            }}
          />

          {/* Totals */}
          <div style={{ fontSize: "11px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span>Pajak (10%)</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "14px",
                marginTop: "8px",
              }}
            >
              <span>TOTAL</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Separator */}
          <div
            style={{
              borderTop: "1px dashed #000",
              margin: "10px 0",
            }}
          />

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              marginTop: "15px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              Terima kasih sudah berbelanja di Avril Mart
            </div>
            <div style={{ marginTop: "5px" }}>Barang yang sudah dibeli</div>
            <div>tidak dapat dikembalikan</div>
          </div>

          {/* Barcode placeholder - you can add actual barcode library if needed */}
          <div
            style={{
              textAlign: "center",
              marginTop: "15px",
              fontSize: "10px",
              letterSpacing: "2px",
            }}
          >
            {sale.id.slice(0, 12).toUpperCase()}
          </div>
        </div>
      </div>
    </>
  );
}