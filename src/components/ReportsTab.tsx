"use client"

import { useInventoryStore } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown, FileSpreadsheet, AlertTriangle, Boxes, History } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export function ReportsTab() {
    const { products, transactions } = useInventoryStore()

    // --- 1. EXCEL EXPORT FUNCTIONS ---
    const exportToExcel = (data: any[], fileName: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    // --- 2. PDF EXPORT FUNCTIONS ---
    const generatePDF = (title: string, head: any[], body: any[]) => {
        const doc = new jsPDF();
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        autoTable(doc, {
            startY: 25,
            head: [head],
            body: body,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 163, 74] } // Emerald Green Header
        });

        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }

    // --- REPORT 1: STOCK VALUATION ---
    const downloadStockExcel = () => {
        const data = products.map(p => ({
            Name: p.name,
            SKU: p.sku,
            Category: p.category,
            Stock: p.stock,
            Unit: p.baseUnit,
            "Purchase Price": p.purchasePrice,
            "Total Value": p.stock * p.purchasePrice
        }));
        exportToExcel(data, "Stock_Report");
    }

    const downloadStockPDF = () => {
        const head = ["Name", "SKU", "Category", "Stock", "Unit", "Rate", "Total Value"];
        const body = products.map(p => [
            p.name, p.sku, p.category, p.stock, p.baseUnit, p.purchasePrice, (p.stock * p.purchasePrice).toLocaleString()
        ]);
        generatePDF("Stock Valuation Report", head, body);
    }

    // --- REPORT 2: TRANSACTION HISTORY ---
    const downloadHistoryExcel = () => {
        const data = transactions.map(t => ({
            Date: t.date,
            Type: t.type,
            "Doc No": t.documentNumber,
            Party: t.partyName,
            Amount: t.totalAmount,
            Items: t.items.map(i => i.productName).join(", ")
        }));
        exportToExcel(data, "Transaction_Log");
    }

    const downloadHistoryPDF = () => {
        const head = ["Date", "Type", "Doc No", "Party", "Items", "Amount"];
        const body = transactions.map(t => [
            t.date, t.type, t.documentNumber, t.partyName,
            t.items.map(i => i.productName).slice(0, 2).join(", ") + (t.items.length > 2 ? "..." : ""),
            t.totalAmount.toLocaleString()
        ]);
        generatePDF("Transaction Log", head, body);
    }

    // --- REPORT 3: LOW STOCK ---
    const downloadLowStockPDF = () => {
        const lowStock = products.filter(p => p.stock <= p.minLevel);
        const head = ["Name", "Stock", "Min Level", "Reorder Qty Needed"];
        const body = lowStock.map(p => [
            p.name, p.stock, p.minLevel, (p.minLevel * 2) - p.stock // Example Logic
        ]);
        generatePDF("Low Stock Report", head, body);
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Card 1: Stock Report */}
            <Card className="bg-white border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-800 flex items-center gap-2"><Boxes className="h-5 w-5 text-emerald-600" /> Stock Valuation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">Full inventory list with stock levels and total valuation.</p>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-slate-300 hover:bg-slate-50 text-slate-700" onClick={downloadStockPDF}>
                            <FileDown className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="outline" className="flex-1 border-green-200 hover:bg-green-50 text-green-700" onClick={downloadStockExcel}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Transaction Log */}
            <Card className="bg-white border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-800 flex items-center gap-2"><History className="h-5 w-5 text-blue-600" /> Transaction Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">Complete history of Inward and Outward stock movements.</p>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-slate-300 hover:bg-slate-50 text-slate-700" onClick={downloadHistoryPDF}>
                            <FileDown className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="outline" className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-700" onClick={downloadHistoryExcel}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Low Stock Alert */}
            <Card className="bg-white border-slate-200 border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-800 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Low Stock Alert</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">Items that are below minimum level. Use for Re-ordering.</p>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={downloadLowStockPDF}>
                        <FileDown className="mr-2 h-4 w-4" /> Download Reorder List (PDF)
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}