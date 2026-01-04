"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"
import { Product } from "@/store/useInventoryStore"
import { SearchableProductSelect } from "@/components/SearchableProductSelect"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TransactionItem {
    productId: string
    quantity: number
    unit: string
    factor: number
    price: number
}

interface Props {
    rows: TransactionItem[]
    setRows: (rows: TransactionItem[]) => void
    products: Product[]
    type: 'IN' | 'OUT'
    onAddNewProduct: (name: string, index: number) => void
}

export function TransactionItemTable({ rows, setRows, products, type, onAddNewProduct }: Props) {

    const addNewRow = () => {
        setRows([...rows, { productId: "", quantity: 0, unit: "", factor: 1, price: 0 }])
    }

    const removeRow = (index: number) => {
        const newRows = [...rows]
        newRows.splice(index, 1)
        setRows(newRows)
    }

    const updateRow = (index: number, field: keyof TransactionItem, value: any) => {
        const newRows = [...rows]
        // @ts-ignore
        newRows[index][field] = value

        if (field === 'productId') {
            const product = products.find(p => p.id === value)
            if (product) {
                newRows[index].price = type === 'IN' ? product.purchasePrice : product.sellingPrice
                newRows[index].unit = product.baseUnit
                newRows[index].factor = 1
            }
        }

        if (field === 'unit') {
            const product = products.find(p => p.id === newRows[index].productId)
            if (product) {
                if (value === product.baseUnit) {
                    newRows[index].factor = 1
                } else {
                    const altUnit = product.alternateUnits?.find(u => u.name === value)
                    if (altUnit) newRows[index].factor = altUnit.factor
                }
            }
        }
        setRows(newRows)
    }

    return (
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm mt-4">
            <h3 className="font-semibold text-slate-800 mb-2">Item List</h3>
            <table className="w-full text-sm text-left mb-4">
                {/* FIX: Table Header Colors */}
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="p-2 w-[35%]">Product</th>
                        <th className="p-2 w-[15%]">Qty</th>
                        <th className="p-2 w-[15%]">Unit</th>
                        <th className="p-2 w-[15%]">Rate</th>
                        <th className="p-2 w-[15%]">Total</th>
                        <th className="p-2 w-[5%]"></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => {
                        const product = products.find(p => p.id === row.productId)
                        return (
                            <tr key={index} className="border-b border-slate-100 last:border-0">
                                <td className="p-2">
                                    <SearchableProductSelect
                                        products={products}
                                        selectedId={row.productId}
                                        onSelect={(val) => updateRow(index, 'productId', val)}
                                        onAddNew={(name) => onAddNewProduct(name, index)}
                                    />
                                </td>
                                <td className="p-2">
                                    <Input type="number" value={row.quantity} onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))} />
                                </td>
                                <td className="p-2">
                                    <Select value={row.unit} onValueChange={(val) => updateRow(index, 'unit', val)} disabled={!row.productId}>
                                        {/* FIX: Select Trigger Colors */}
                                        <SelectTrigger className="h-9 bg-white border-slate-200">
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {product && (
                                                <>
                                                    <SelectItem value={product.baseUnit}>{product.baseUnit} (1)</SelectItem>
                                                    {product.alternateUnits?.map((u, i) => (
                                                        <SelectItem key={i} value={u.name}>{u.name} ({u.factor})</SelectItem>
                                                    ))}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="p-2">
                                    <Input type="number" value={row.price} onChange={(e) => updateRow(index, 'price', Number(e.target.value))} />
                                </td>
                                <td className="p-2 font-mono text-slate-700">₹{(row.quantity * row.factor * row.price).toLocaleString()}</td>
                                <td className="p-2 text-center">
                                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8" onClick={() => removeRow(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* FIX: "+ Add Another Row" button made light and clean */}
            <Button size="sm" variant="outline" onClick={addNewRow} className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                <Plus className="h-4 w-4 mr-1" /> Add Another Row
            </Button>
        </div>
    )
}