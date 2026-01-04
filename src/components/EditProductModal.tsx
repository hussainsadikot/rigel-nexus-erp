"use client"

import { useState, useEffect } from "react"
import { useInventoryStore, Product } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"

interface Props {
    product: Product | null // Je product edit karvani chhe
    isOpen: boolean
    onClose: () => void
}

export function EditProductModal({ product, isOpen, onClose }: Props) {
    const { updateProduct } = useInventoryStore()

    // Form State
    const [formData, setFormData] = useState<any>({})
    const [altUnits, setAltUnits] = useState<{ name: string, factor: number }[]>([])

    // Jyaare Modal khule, tyare juno data lavi do
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                brand: product.brand,
                manufacturer: product.manufacturer,
                stock: product.stock,
                minLevel: product.minLevel,
                purchasePrice: product.purchasePrice,
                sellingPrice: product.sellingPrice,
                baseUnit: product.baseUnit
            })
            // Alternate units load karo
            setAltUnits(product.alternateUnits || [])
        }
    }, [product])

    const addUnitRow = () => setAltUnits([...altUnits, { name: "", factor: 1 }])

    const removeUnitRow = (index: number) => {
        const newUnits = [...altUnits]; newUnits.splice(index, 1); setAltUnits(newUnits)
    }

    const updateUnitRow = (index: number, field: string, value: any) => {
        const newUnits = [...altUnits];
        // @ts-ignore
        newUnits[index][field] = value;
        setAltUnits(newUnits)
    }

    const handleSubmit = () => {
        if (!product) return;

        updateProduct(product.id, {
            ...formData,
            stock: Number(formData.stock),
            minLevel: Number(formData.minLevel),
            purchasePrice: Number(formData.purchasePrice),
            sellingPrice: Number(formData.sellingPrice),
            alternateUnits: altUnits.filter(u => u.name && u.factor > 0)
        })

        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-white text-black max-h-[90vh] overflow-y-auto z-[100]">
                <DialogHeader><DialogTitle>Edit Product: {product?.name}</DialogTitle></DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-black" /></div>
                        <div><Label>Category</Label><Input value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="text-black" /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Brand</Label><Input value={formData.brand || ''} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="text-black" /></div>
                        <div><Label>Manufacturer</Label><Input value={formData.manufacturer || ''} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} className="text-black" /></div>
                    </div>

                    {/* UNIT CONFIGURATION (EDITABLE) */}
                    <div className="border p-3 rounded-md bg-slate-50">
                        <Label className="text-emerald-700 font-bold mb-2 block">Unit Configuration</Label>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div><Label className="text-xs">Base Unit</Label><Input value={formData.baseUnit || ''} onChange={e => setFormData({ ...formData, baseUnit: e.target.value })} className="text-black bg-white" /></div>
                        </div>

                        {altUnits.map((unit, index) => (
                            <div key={index} className="flex gap-2 items-end mb-2">
                                <div className="w-1/3"><Input value={unit.name} onChange={e => updateUnitRow(index, 'name', e.target.value)} className="text-black bg-white h-8" /></div>
                                <div className="w-1/3"><Input type="number" value={unit.factor} onChange={e => updateUnitRow(index, 'factor', Number(e.target.value))} className="text-black bg-white h-8" /></div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeUnitRow(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addUnitRow} className="mt-2 text-xs border-dashed w-full">+ Add Unit (Box, Kg)</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Purchase Price</Label><Input type="number" value={formData.purchasePrice || 0} onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} className="text-black" /></div>
                        <div><Label>Selling Price</Label><Input type="number" value={formData.sellingPrice || 0} onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} className="text-black" /></div>
                    </div>
                </div>
                <DialogFooter><Button onClick={handleSubmit}>Update Product</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    )
}