"use client"

import { useState, useEffect } from "react"
import { useInventoryStore, Transaction } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { AddProductModal } from "@/components/AddProductModal"
import { TransactionItemTable, TransactionItem } from "@/components/TransactionItemTable"
import { Calendar, FileText, User } from "lucide-react"

interface Props {
    transaction: Transaction | null
    isOpen: boolean
    onClose: () => void
}

export function EditTransactionModal({ transaction, isOpen, onClose }: Props) {
    const { products, updateTransaction } = useInventoryStore()
    const [isCatalogOpen, setIsCatalogOpen] = useState(false)

    // States
    const [date, setDate] = useState("")
    const [partyName, setPartyName] = useState("")
    const [docNumber, setDocNumber] = useState("")
    const [docDate, setDocDate] = useState("")
    const [docType, setDocType] = useState<"INVOICE" | "CHALLAN">("INVOICE")

    const [rows, setRows] = useState<TransactionItem[]>([])

    useEffect(() => {
        if (transaction) {
            setDate(transaction.date)
            setPartyName(transaction.partyName)
            setDocNumber(transaction.documentNumber)
            setDocDate(transaction.documentDate || "")
            setDocType(transaction.documentType || "INVOICE")

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
            date, // Have aa USER EDIT kareli date save thase
            partyName,
            documentNumber: docNumber,
            documentDate: docDate,
            documentType: docType,
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
            <AddProductModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
            />

            <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
                <DialogContent className="sm:max-w-[900px] bg-slate-50 text-black p-0 overflow-hidden">

                    <DialogHeader className="bg-blue-600 text-white p-4">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Edit Transaction ({transaction?.type === 'IN' ? 'Inward' : 'Outward'})
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 p-6 max-h-[80vh] overflow-y-auto">

                        <div className="bg-white p-4 rounded-md border shadow-sm space-y-4">

                            {/* ROW 1: Party Name & Transaction Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-600 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Party / Vendor Name</Label>
                                    <Input value={partyName} onChange={e => setPartyName(e.target.value)} className="text-black font-medium" />
                                </div>
                                <div>
                                    {/* FIX: Removed 'disabled' and changed color back to normal */}
                                    <Label className="text-emerald-700 font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> System Entry Date (Editable)</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)} // Have aa change thase
                                        className="text-black font-medium border-emerald-200"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 my-2"></div>

                            {/* ROW 2: Document Details */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-blue-700 font-bold mb-1">Document Type</Label>
                                    <Select value={docType} onValueChange={(val: any) => setDocType(val)}>
                                        <SelectTrigger className="border-blue-200 bg-blue-50/50 text-black">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INVOICE">Invoice (Bill)</SelectItem>
                                            <SelectItem value="CHALLAN">Delivery Challan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-blue-700 font-bold mb-1">Doc No.</Label>
                                    <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="border-blue-200 bg-blue-50/50 text-black font-semibold" />
                                </div>

                                <div>
                                    <Label className="text-blue-700 font-bold mb-1">Doc Date</Label>
                                    <Input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} className="border-blue-200 bg-blue-50/50 text-black font-semibold" />
                                </div>
                            </div>
                        </div>

                        <TransactionItemTable
                            rows={rows}
                            setRows={setRows}
                            products={products}
                            type={transaction?.type || 'IN'}
                            onAddNewProduct={() => setIsCatalogOpen(true)}
                        />
                    </div>

                    <DialogFooter className="p-4 bg-slate-100 border-t">
                        <Button variant="outline" className="text-slate-900 bg-white" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Update Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}