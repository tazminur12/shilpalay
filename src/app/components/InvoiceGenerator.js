"use client";

import { useRef, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';

export default function InvoiceGenerator({ invoiceData, onClose }) {
  const invoiceRef = useRef(null);

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceData.invoiceNumber}</title>
          <style>
            ${getInvoiceStyles()}
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    handlePrint(); // Browser print dialog can save as PDF
  };

  if (!invoiceData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-black transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-black transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="p-8 invoice-content">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">{invoiceData.company.name}</h1>
                <p className="text-gray-600">{invoiceData.company.address}</p>
                <p className="text-gray-600">Phone: {invoiceData.company.phone}</p>
                <p className="text-gray-600">Email: {invoiceData.company.email}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold mb-4">INVOICE</h2>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold">Invoice #:</span> {invoiceData.invoiceNumber}</p>
                  <p><span className="font-semibold">Order #:</span> {invoiceData.orderNumber}</p>
                  <p><span className="font-semibold">Date:</span> {formatDate(invoiceData.invoiceDate)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-2">Bill To:</h3>
                <p>{invoiceData.customer.name}</p>
                <p className="text-gray-600">{invoiceData.customer.email}</p>
                <p className="text-gray-600">{invoiceData.customer.mobile}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Ship To:</h3>
                <p>{invoiceData.shippingAddress.firstName} {invoiceData.shippingAddress.lastName}</p>
                <p className="text-gray-600">{invoiceData.shippingAddress.streetAddress1}</p>
                {invoiceData.shippingAddress.streetAddress2 && (
                  <p className="text-gray-600">{invoiceData.shippingAddress.streetAddress2}</p>
                )}
                <p className="text-gray-600">
                  {invoiceData.shippingAddress.city}, {invoiceData.shippingAddress.district}
                </p>
                <p className="text-gray-600">
                  {invoiceData.shippingAddress.zipCode}, {invoiceData.shippingAddress.country}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border border-gray-300">Item</th>
                <th className="text-left p-3 border border-gray-300">SKU</th>
                <th className="text-center p-3 border border-gray-300">Qty</th>
                <th className="text-right p-3 border border-gray-300">Unit Price</th>
                <th className="text-right p-3 border border-gray-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 border border-gray-300">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.variation && (
                        <p className="text-xs text-gray-500">
                          {item.variation.color && `Color: ${item.variation.color}`}
                          {item.variation.size && ` | Size: ${item.variation.size}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-600">{item.sku}</td>
                  <td className="p-3 border border-gray-300 text-center">{item.quantity}</td>
                  <td className="p-3 border border-gray-300 text-right">Tk {item.unitPrice.toFixed(2)}</td>
                  <td className="p-3 border border-gray-300 text-right font-semibold">Tk {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Tk {invoiceData.subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-Tk {invoiceData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>Tk {invoiceData.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT:</span>
                <span>Tk {invoiceData.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>Tk {invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-gray-300 pt-4 text-sm text-gray-600">
            <p><span className="font-semibold">Payment Method:</span> {invoiceData.paymentMethod.toUpperCase()}</p>
            <p><span className="font-semibold">Payment Status:</span> {invoiceData.paymentStatus.toUpperCase()}</p>
            <p><span className="font-semibold">Order Status:</span> {invoiceData.status.toUpperCase()}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p className="mt-1">This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInvoiceStyles() {
  return `
    @media print {
      body { margin: 0; padding: 20px; }
      .invoice-content { padding: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      color: #000;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
  `;
}
