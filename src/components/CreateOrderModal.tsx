"use client"

import { useState } from "react"
import { useInventoryStore, Product } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ClipboardList, ShoppingCart } from "lucide-react"
import { AddProductModal } from "@/components/AddProductModal"
import { TransactionItemTable, TransactionItem } from "@/components/TransactionItemTable"

interface Props {
    type: 'PURCHASE' | 'SALES' // PO ke SO?
}

export function CreateOrderModal({ type }: Props) {
    const { products, addOrder } = useInventoryStore()
    const [open, setOpen] = useState(false)

    const [isCatalogOpen, setIsCatalogOpen] = useState(false)
    const [pendingName, setPendingName] = useState("")
    const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null)

    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [expectedDate, setExpectedDate] = useState("")
    const [partyName, setPartyName] = useState("")
    const [orderNumber, setOrderNumber] = useState("") // PO Number

    const [rows, setRows] = useState<TransactionItem[]>([{ productId: "", quantity: 0, unit: "", factor: 1, price: 0 }])

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
        if (!partyName || !orderNumber) { alert("Please fill Party & Order No."); return; }
        const validItems = rows.filter(r => r.productId && r.quantity > 0)
        if (validItems.length === 0) { alert("Please add items"); return; }

        addOrder({
            id: crypto.randomUUID(),
            date,
            expectedDate,
            type,
            status: 'PENDING',
            partyName,
            orderNumber,
            items: validItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unit: item.unit,
                factor: item.factor,
                price: item.price
            })),
            totalAmount: validItems.reduce((acc, i) => acc + (i.quantity * i.factor * i.price), 0)
        })

        setOpen(false)
        setRows([{ productId: "", quantity: 0, unit: "", factor: 1, price: 0 }])
        setPartyName(""); setOrderNumber("");
    }

    const title = type === 'PURCHASE' ? "New Purchase Order (PO)" : "New Sales Order (SO)"
    const colorClass = type === 'PURCHASE' ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"

    return (
        <>
            <AddProductModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} initialName={pendingName} onProductAdded={handleProductAdded} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className={`${colorClass} text-white gap-2 shadow-sm`}>
                        {type === 'PURCHASE' ? <ClipboardList className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        {type === 'PURCHASE' ? "Create PO" : "Create Order"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] bg-slate-50 text-black max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-md border shadow-sm">
                            <div className="col-span-2"><Label>Party Name</Label><Input value={partyName} onChange={e => setPartyName(e.target.value)} className="text-black" /></div>
                            <div className="col-span-1"><Label>{type === 'PURCHASE' ? 'PO No.' : 'SO No.'}</Label><Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} className="text-black" /></div>
                            <div className="col-span-1"><Label>Exp. Date</Label><Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="text-black" /></div>
                        </div>

                        <TransactionItemTable
                            rows={rows} setRows={setRows} products={products}
                            type={type === 'PURCHASE' ? 'IN' : 'OUT'} // Rate reference mate
                            onAddNewProduct={(name, index) => { setPendingName(name); setActiveRowIndex(index); setIsCatalogOpen(true); }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button className={`${colorClass} w-40 text-white`} onClick={handleSubmit}>Save Order</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}