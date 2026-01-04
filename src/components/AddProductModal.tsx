"use client"
import { useState, useEffect } from "react"
import { useInventoryStore, Product } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"

interface Props {
    isOpen?: boolean;
    onClose?: () => void;
    initialName?: string;
    onProductAdded?: (product: Product) => void;
}

export function AddProductModal({ isOpen, onClose, initialName = "", onProductAdded }: Props) {
    const { addProduct } = useInventoryStore()
    const [internalOpen, setInternalOpen] = useState(false)

    const showModal = isOpen !== undefined ? isOpen : internalOpen
    const setShowModal = (val: boolean) => {
        if (!val) setFormData(prev => ({ ...prev, name: "" }))
        onClose ? onClose() : setInternalOpen(val)
    }

    const [formData, setFormData] = useState({
        name: "", category: "", brand: "", manufacturer: "", stock: 0, minLevel: 10, purchasePrice: 0, sellingPrice: 0, baseUnit: "Pcs"
    })
    const [altUnits, setAltUnits] = useState<{ name: string, factor: number }[]>([])

    useEffect(() => {
        if (showModal && initialName) {
            setFormData(prev => ({ ...prev, name: initialName }))
        }
    }, [showModal, initialName])

    const addUnitRow = () => setAltUnits([...altUnits, { name: "", factor: 1 }])
    const removeUnitRow = (index: number) => { const newUnits = [...altUnits]; newUnits.splice(index, 1); setAltUnits(newUnits) }
    const updateUnitRow = (index: number, field: string, value: any) => {
        const newUnits = [...altUnits];
        (newUnits[index] as any)[field] = value;
        setAltUnits(newUnits)
    }

    const generateSKU = (c: string, b: string) => { const cat = c ? c.slice(0, 3).toUpperCase() : "GEN"; const br = b ? b.slice(0, 3).toUpperCase() : "ITM"; return `${cat}-${br}-${Math.floor(1000 + Math.random() * 9000)}` }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.category) { alert("Please fill Name and Category"); return; }

        const newProduct: Product = {
            id: crypto.randomUUID(), ...formData, sku: generateSKU(formData.category, formData.brand),
            stock: Number(formData.stock), minLevel: Number(formData.minLevel), purchasePrice: Number(formData.purchasePrice), sellingPrice: Number(formData.sellingPrice),
            baseUnit: formData.baseUnit, alternateUnits: altUnits.filter(u => u.name && u.factor > 0)
        }

        addProduct(newProduct)
        if (onProductAdded) onProductAdded(newProduct);

        setShowModal(false)
        setFormData({ name: "", category: "", brand: "", manufacturer: "", stock: 0, minLevel: 10, purchasePrice: 0, sellingPrice: 0, baseUnit: "Pcs" })
        setAltUnits([])
    }

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            {isOpen === undefined && (<DialogTrigger asChild><Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2"><Plus className="h-4 w-4" /> Add Item</Button></DialogTrigger>)}
            <DialogContent className="sm:max-w-[600px] bg-white text-slate-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add New Catalog Item</DialogTitle></DialogHeader>
                <form className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="font-bold border-slate-300" /></div>
                        <div><Label>Category</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="border-slate-300" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4"><div><Label>Brand</Label><Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="border-slate-300" /></div><div><Label>Manufacturer</Label><Input value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} className="border-slate-300" /></div></div>

                    {/* Unit Section Style Updated */}
                    <div className="border border-slate-200 p-3 rounded-md bg-slate-50">
                        <Label className="text-emerald-700 font-bold mb-2 block">Unit Configuration</Label>
                        <div className="grid grid-cols-2 gap-4 mb-2"><div><Label className="text-xs">Base Unit</Label><Input value={formData.baseUnit} onChange={e => setFormData({ ...formData, baseUnit: e.target.value })} className="bg-white border-slate-300" /></div></div>
                        {altUnits.map((unit, index) => (
                            <div key={index} className="flex gap-2 items-end mb-2">
                                <div className="w-1/3"><Input value={unit.name} onChange={e => updateUnitRow(index, 'name', e.target.value)} placeholder="Box" className="bg-white h-8 border-slate-300" /></div>
                                <div className="w-1/3"><Input type="number" value={unit.factor} onChange={e => updateUnitRow(index, 'factor', Number(e.target.value))} className="bg-white h-8 border-slate-300" /></div>
                                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeUnitRow(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        {/* FIX: Aa Button 'Outline' kari didhu */}
                        <Button type="button" variant="outline" size="sm" onClick={addUnitRow} className="mt-2 text-xs border-dashed border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 w-full">+ Add Unit</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4"><div><Label>Purchase Price</Label><Input type="number" value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} className="border-slate-300" /></div><div><Label>Selling Price</Label><Input type="number" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} className="border-slate-300" /></div></div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4"><div><Label>Opening Stock</Label><Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="border-slate-300" /></div><div><Label>Min Level</Label><Input type="number" value={formData.minLevel} onChange={e => setFormData({ ...formData, minLevel: Number(e.target.value) })} className="border-slate-300" /></div></div>
                </form>
                <DialogFooter><Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>Save to Catalog</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    )
}