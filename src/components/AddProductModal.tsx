"use client"

import { useState } from "react"
import { useInventoryStore } from "@/store/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function AddProductModal() {
    const addProduct = useInventoryStore((state) => state.addProduct)
    const [open, setOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        stock: 0,
        unit: "Pcs",
        minLevel: 10,
        price: 0,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Validation: Check if fields are empty
        if (!formData.name || !formData.sku) return;

        addProduct({
            id: crypto.randomUUID(), // Unique ID generate kare
            ...formData,
            stock: Number(formData.stock),
            minLevel: Number(formData.minLevel),
            price: Number(formData.price),
        })

        setOpen(false) // Modal bandh kare
        // Form reset kare
        setFormData({ name: "", sku: "", category: "", stock: 0, unit: "Pcs", minLevel: 10, price: 0 })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
                    <Plus className="h-4 w-4" /> Add New Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new hardware item to track.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" className="col-span-3" placeholder="e.g. Hammer Drill"
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sku" className="text-right">SKU</Label>
                        <Input id="sku" className="col-span-3" placeholder="e.g. HD-200"
                            value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input id="category" className="col-span-3" placeholder="e.g. Power Tools"
                            value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Stock</Label>
                            <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
                        </div>
                        <div>
                            <Label>Price (₹)</Label>
                            <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Save Product</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}