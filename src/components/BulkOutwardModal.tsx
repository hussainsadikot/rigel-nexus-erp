"use client"

import { useState } from "react"
import { useInventoryStore } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowUpCircle } from "lucide-react"

import { TransactionItemTable, TransactionItem } from "@/components/TransactionItemTable"

export function BulkOutwardModal() {
    const { products, addTransaction } = useInventoryStore()
    const [open, setOpen] = useState(false)

    const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0])
    const [documentDate, setDocumentDate] = useState("")
    const [partyName, setPartyName] = useState("")
    const [documentNumber, setDocumentNumber] = useState("")
    const [documentType, setDocumentType] = useState<'INVOICE' | 'CHALLAN'>("INVOICE")

    // FIX: Initial State Updated
    const [rows, setRows] = useState<TransactionItem[]>([
        { productId: "", quantity: 0, unit: "", factor: 1, price: 0 }
    ])

    const handleSubmit = () => {
        if (!partyName || !documentNumber || !documentDate) { alert("Please fill details"); return; }

        const validItems = rows.filter(r => r.productId && r.quantity > 0)
        if (validItems.length === 0) { alert("Please add items"); return; }

        // STOCK VALIDATION (Check against Base Unit Stock)
        for (const item of validItems) {
            const product = products.find(p => p.id === item.productId)
            // Check: User Qty * Factor (e.g. 5 Box * 50 = 250 Pcs) <= Available Stock
            const totalReqQty = item.quantity * item.factor;

            if (product && product.stock < totalReqQty) {
                alert(`Error: Not enough stock for "${product.name}". Required: ${totalReqQty} ${product.baseUnit}, Available: ${product.stock} ${product.baseUnit}`)
                return
            }
        }

        addTransaction({
            id: crypto.randomUUID(),
            date: dispatchDate,
            documentDate,
            type: 'OUT',
            documentType,
            documentNumber,
            partyName,
            items: validItems.map(item => {
                const prod = products.find(p => p.id === item.productId)
                return {
                    productId: item.productId,
                    productName: prod?.name || "Unknown",
                    quantity: item.quantity,
                    price: item.price,
                    // NEW UNIT FIELDS
                    unit: item.unit,
                    conversionFactor: item.factor,
                    finalQuantity: item.quantity * item.factor // Save Final Pcs
                }
            }),
            totalAmount: validItems.reduce((acc, i) => acc + (i.quantity * i.factor * i.price), 0)
        })

        setOpen(false)
        setRows([{ productId: "", quantity: 0, unit: "", factor: 1, price: 0 }])
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm">
                    <ArrowUpCircle className="h-4 w-4" /> Stock Out (Dispatch)
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[900px] bg-slate-50 text-black max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-red-700">Outward Stock Entry (Dispatch)</DialogTitle></DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-md border shadow-sm border-l-4 border-l-red-500">
                        <div className="col-span-2"><Label>Party / Project</Label><Input value={partyName} onChange={e => setPartyName(e.target.value)} className="text-black" /></div>
                        <div className="col-span-1"><Label>Doc No</Label><Input value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} className="text-black" /></div>
                        <div className="col-span-1"><Label>Doc Date</Label><Input type="date" value={documentDate} onChange={e => setDocumentDate(e.target.value)} className="text-black" /></div>
                    </div>

                    <TransactionItemTable
                        rows={rows}
                        setRows={setRows}
                        products={products}
                        type="OUT"
                        onAddNewProduct={() => alert("Cannot create new item during Dispatch. Please add to Catalog first.")}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700 w-40 text-white" onClick={handleSubmit}>
                        Confirm Dispatch
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}