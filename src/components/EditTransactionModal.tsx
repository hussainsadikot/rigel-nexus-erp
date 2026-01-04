"use client"

import { useState, useEffect } from "react"
import { useInventoryStore, Transaction } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// 1. IMPORT ADDED
import { AddProductModal } from "@/components/AddProductModal"
import { TransactionItemTable, TransactionItem } from "@/components/TransactionItemTable"

interface Props {
    transaction: Transaction | null
    isOpen: boolean
    onClose: () => void
}

export function EditTransactionModal({ transaction, isOpen, onClose }: Props) {
    const { products, updateTransaction } = useInventoryStore()

    // 2. NEW STATE FOR CATALOG MODAL
    const [isCatalogOpen, setIsCatalogOpen] = useState(false)

    // Form States
    const [date, setDate] = useState("")
    const [partyName, setPartyName] = useState("")
    const [docNumber, setDocNumber] = useState("")
    const [docDate, setDocDate] = useState("")
    const [rows, setRows] = useState<TransactionItem[]>([])

    useEffect(() => {
        if (transaction) {
            setDate(transaction.date)
            setPartyName(transaction.partyName)
            setDocNumber(transaction.documentNumber)
            setDocDate(transaction.documentDate)

            setRows(transaction.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                unit: i.unit,
                factor: i.conversionFactor || 1,
                price: i.price
            })))
        }
    }, [transaction])

    const handleSubmit = () => {
        if (!transaction) return;

        const validItems = rows.filter(r => r.productId && r.quantity > 0)
        if (validItems.length === 0) { alert("Items cannot be empty"); return; }

        const updatedTxn: Transaction = {
            ...transaction,
            date,
            partyName,
            documentNumber: docNumber,
            documentDate: docDate,
            items: validItems.map(item => {
                const prod = products.find(p => p.id === item.productId)
                return {
                    productId: item.productId,
                    productName: prod?.name || "Unknown",
                    quantity: item.quantity,
                    unit: item.unit,
                    conversionFactor: item.factor,
                    finalQuantity: item.quantity * item.factor,
                    price: item.price
                }
            }),
            totalAmount: validItems.reduce((acc, i) => acc + (i.quantity * i.factor * i.price), 0)
        }

        updateTransaction(transaction.id, updatedTxn)
        onClose()
    }

    return (
        <>
            {/* 3. CATALOG MODAL CONNECTED HERE */}
            <AddProductModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
            />

            <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
                <DialogContent className="sm:max-w-[900px] bg-slate-50 text-black max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction ({transaction?.type === 'IN' ? 'Inward' : 'Outward'})</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-md border shadow-sm">
                            <div><Label>Party Name</Label><Input value={partyName} onChange={e => setPartyName(e.target.value)} className="text-black" /></div>
                            <div><Label>Doc Number</Label><Input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="text-black" /></div>
                            <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-black" /></div>
                        </div>

                        {/* 4. PASS TRIGGER TO TABLE */}
                        <TransactionItemTable
                            rows={rows}
                            setRows={setRows}
                            products={products}
                            type={transaction?.type || 'IN'}
                            // Ahiya "Alert" hatavi ne "State Change" logic mukyu
                            onAddNewProduct={() => setIsCatalogOpen(true)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">Update Transaction</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}