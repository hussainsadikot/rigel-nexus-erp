"use client"

import { useState } from "react"
import { useInventoryStore, Product } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowDownCircle } from "lucide-react"
import { AddProductModal } from "@/components/AddProductModal"
import { TransactionItemTable, TransactionItem } from "@/components/TransactionItemTable"

export function BulkInwardModal() {
    const { products, addTransaction } = useInventoryStore()
    const [open, setOpen] = useState(false)

    const [isCatalogOpen, setIsCatalogOpen] = useState(false)
    const [pendingName, setPendingName] = useState("")
    const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null)

    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])
    const [documentDate, setDocumentDate] = useState("")
    const [partyName, setPartyName] = useState("")
    const [documentNumber, setDocumentNumber] = useState("")
    const [documentType, setDocumentType] = useState<'INVOICE' | 'CHALLAN'>("INVOICE")

    const [rows, setRows] = useState<TransactionItem[]>([
        { productId: "", quantity: 0, unit: "", factor: 1, price: 0 }
    ])

    const handleProductAdded = (newProduct: Product) => {
        if (activeRowIndex !== null) {
            const newRows = [...rows];
            newRows[activeRowIndex].productId = newProduct.id;
            newRows[activeRowIndex].unit = newProduct.baseUnit;
            newRows[activeRowIndex].factor = 1;
            newRows[activeRowIndex].price = newProduct.purchasePrice;
            setRows(newRows);
        }
    }

    const handleSubmit = () => {
        if (!partyName || !documentNumber || !documentDate) { alert("Please fill Vendor, Doc Number & Date"); return; }

        const itemsWithProduct = rows.filter(r => r.productId);
        const zeroQtyItems = itemsWithProduct.filter(r => r.quantity <= 0);

        if (zeroQtyItems.length > 0) {
            alert(`Warning: ${zeroQtyItems.length} items have 0 Quantity. They will be ignored.`);
        }

        const validItems = itemsWithProduct.filter(r => r.quantity > 0);
        if (validItems.length === 0) { alert("No valid items to save (Qty must be > 0)"); return; }

        addTransaction({
            id: crypto.randomUUID(), date: receivedDate, documentDate, type: 'IN', documentType, documentNumber, partyName,
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
        <>
            <AddProductModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                initialName={pendingName}
                onProductAdded={handleProductAdded}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                        <ArrowDownCircle className="h-4 w-4" /> Stock In (Purchase)
                    </Button>
                </DialogTrigger>
                {/* FIX: Modal background white and text dark */}
                <DialogContent className="sm:max-w-[900px] bg-white text-slate-900 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Inward Stock Entry</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                            <div className="col-span-2"><Label>Vendor Name</Label><Input value={partyName} onChange={e => setPartyName(e.target.value)} /></div>
                            <div className="col-span-1"><Label>Doc No</Label><Input value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} /></div>
                            <div className="col-span-1"><Label>Bill Date</Label><Input type="date" value={documentDate} onChange={e => setDocumentDate(e.target.value)} /></div>
                        </div>

                        <TransactionItemTable
                            rows={rows}
                            setRows={setRows}
                            products={products}
                            type="IN"
                            onAddNewProduct={(name, index) => {
                                setPendingName(name);
                                setActiveRowIndex(index);
                                setIsCatalogOpen(true);
                            }}
                        />
                    </div>
                    <DialogFooter>
                        {/* FIX: Button Colors */}
                        <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 w-40 text-white" onClick={handleSubmit}>Confirm Stock In</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}