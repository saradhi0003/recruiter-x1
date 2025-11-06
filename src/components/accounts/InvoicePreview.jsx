import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function InvoicePreview({ invoice }) {
  const logo =
    invoice?.brand_logo_url ||
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/291ea5029_TalentStackCorporateImages-1.png";

  const companyName = invoice?.from_company || "Talent Stack Talent & Acquisitions";
  const fromAddress =
    invoice?.from_address ||
    "123 Main Street, Suite 400, New York, NY 10001";
  const payNotes =
    invoice?.payment_instructions ||
    "All fees are listed in USD and may be subject to applicable taxes.";

  const items = invoice?.items || [];
  const subtotal =
    typeof invoice?.subtotal === "number"
      ? invoice.subtotal
      : items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
  const taxAmount =
    typeof invoice?.tax_amount === "number"
      ? invoice.tax_amount
      : subtotal * (Number(invoice?.tax_rate || 0) / 100);
  const total =
    typeof invoice?.total === "number" ? invoice.total : subtotal + taxAmount;

  const printPreview = () => {
    window.print();
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-slate-500">Preview</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CreditCard className="w-4 h-4" /> Pay now
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={printPreview}>
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      </div>
      <Card className="bg-white mx-auto border shadow-sm">
        <div className="p-8 max-w-[720px] mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-md object-contain" />
              <div>
                <div className="font-bold text-slate-900">{companyName}</div>
                <div className="text-xs text-slate-500">{fromAddress}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-800">Invoice</div>
              <div className="text-xs text-slate-500 mt-1">
                Invoice number{" "}
                <span className="font-medium text-slate-700">
                  {invoice?.invoice_number || "INV-DRAFT"}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Invoice date{" "}
                <span className="font-medium text-slate-700">
                  {invoice?.issue_date ? format(new Date(invoice.issue_date), "PPP") : "-"}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Due date{" "}
                <span className="font-medium text-slate-700">
                  {invoice?.due_date ? format(new Date(invoice.due_date), "PPP") : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Bill to + Total */}
          <div className="grid grid-cols-12 gap-6 mt-8">
            <div className="col-span-8">
              <div className="text-xs text-slate-500">Bill to</div>
              <div className="font-medium text-slate-800">
                {invoice?.bill_to_name || "—"}
              </div>
              {invoice?.bill_to_address && (
                <div className="text-sm text-slate-600 whitespace-pre-line">
                  {invoice.bill_to_address}
                </div>
              )}
              {invoice?.bill_to_email && (
                <div className="text-xs text-slate-500 mt-1">{invoice.bill_to_email}</div>
              )}
            </div>
            <div className="col-span-4">
              <div className="rounded-md border p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-xl font-bold text-slate-800">
                  {(total || 0).toLocaleString(undefined, {
                    style: "currency",
                    currency: invoice?.currency || "USD",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6 border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 text-xs font-medium text-slate-600 px-3 py-2">
              <div className="col-span-6">Products & Services</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {items.map((it, i) => {
              const amount =
                typeof it.amount === "number"
                  ? it.amount
                  : Number(it.quantity || 0) * Number(it.unit_price || 0);
              return (
                <div key={i} className="grid grid-cols-12 px-3 py-2 text-sm border-t">
                  <div className="col-span-6">
                    <div className="font-medium text-slate-800">{it.description || "—"}</div>
                  </div>
                  <div className="col-span-2 text-right">{it.quantity || 0}</div>
                  <div className="col-span-2 text-right">
                    {Number(it.unit_price || 0).toLocaleString(undefined, {
                      style: "currency",
                      currency: invoice?.currency || "USD",
                    })}
                  </div>
                  <div className="col-span-2 text-right">
                    {amount.toLocaleString(undefined, {
                      style: "currency",
                      currency: invoice?.currency || "USD",
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-4 ml-auto max-w-xs">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-800">
                {subtotal.toLocaleString(undefined, {
                  style: "currency",
                  currency: invoice?.currency || "USD",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium text-slate-800">
                {taxAmount.toLocaleString(undefined, {
                  style: "currency",
                  currency: invoice?.currency || "USD",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2 border-t pt-2">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="font-semibold text-slate-900">
                {total.toLocaleString(undefined, {
                  style: "currency",
                  currency: invoice?.currency || "USD",
                })}
              </span>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-500">
            {payNotes}
          </div>
        </div>
      </Card>
    </div>
  );
}