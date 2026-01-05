"use client"
import { useState } from "react"
// ... imports same ...
import { useInventoryStore, Product } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowUpCircle } from "lucide-react"
import { AddProductModal } from "@/components/AddProductModal"
import { TransactionItemTable, TransactionItem } from "@/components/TransactionItemTable"

export function BulkOutwardModal() {
    const { products, addTransaction } = useInventoryStore()
    const [open, setOpen] = useState(false)

    // FIX: Separate States
    const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]) // Today
    const [documentDate, setDocumentDate] = useState("") // Bill Date
    const [partyName, setPartyName] = useState("")
    const [documentNumber, setDocumentNumber] = useState("")

    const [rows, setRows] = useState<TransactionItem[]>([{ productId: "", quantity: 0, unit: "", factor: 1, price: 0 }])

    const handleSubmit = () => {
        if (!partyName || !documentNumber || !documentDate) { alert("Please fill Party, Doc No & Bill Date"); return; }

        // ... validation ...
        const itemsWithProduct = rows.filter(r => r.productId);
        const validItems = itemsWithProduct.filter(r => r.quantity > 0);
        if (validItems.length === 0) { alert("No items"); return; }

        addTransaction({
            id: crypto.randomUUID(),
            date: dispatchDate,         // <-- Physical Date
            documentDate: documentDate, // <-- Bill Date
            type: 'OUT',
            documentType: 'INVOICE', documentNumber, partyName,
            items: validItems.map(item => {
                const prod = products.find(p => p.id === item.productId)
                return {
                    productId: item.productId, productName: prod?.name || "Unknown", quantity: item.quantity, price: item.price,
                    unit: item.unit, conversionFactor: item.factor, finalQuantity: item.quantity * item.factor
                }
            }),
            totalAmount: validItems.reduce((acc, i) => acc + (i.quantity * i.factor * i.price), 0)
        })
        setOpen(false)
        setRows([{ productId: "", quantity: 0, unit: "", factor: 1, price: 0 }])
        setPartyName(""); setDocumentNumber(""); setDocumentDate("");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm"><ArrowUpCircle className="h-4 w-4" /> Stock Out (Dispatch)</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] bg-white text-slate-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Outward Stock Entry (Dispatch)</DialogTitle></DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                        <div className="col-span-2"><Label>Party / Project</Label><Input value={partyName} onChange={e => setPartyName(e.target.value)} /></div>
                        <div className="col-span-1"><Label>Doc No</Label><Input value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} /></div>

                        {/* FIX: Dates */}
                        <div className="col-span-1"><Label>Bill Date</Label><Input type="date" value={documentDate} onChange={e => setDocumentDate(e.target.value)} /></div>
                        <div className="col-span-1"><Label className="text-red-700">Dispatch Date</Label><Input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)} /></div>
                    </div>

                    <TransactionItemTable rows={rows} setRows={setRows} products={products} type="OUT" onAddNewProduct={() => { }} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-300 text-slate-700">Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700 w-40 text-white" onClick={handleSubmit}>Confirm Dispatch</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}