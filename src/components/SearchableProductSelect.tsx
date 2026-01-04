"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Product } from "@/store/useInventoryStore"

interface Props {
    products: Product[]
    selectedId: string
    onSelect: (id: string) => void
    onAddNew?: (name: string) => void // Accepts name string
}

export function SearchableProductSelect({ products, selectedId, onSelect, onAddNew }: Props) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("") // Store search text

    const selectedProduct = products.find((p) => p.id === selectedId)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-black bg-slate-50 border-slate-200 truncate">
                    {selectedProduct ? `${selectedProduct.name}` : "Search item..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-white">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        className="text-black"
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        <CommandEmpty className="py-2 px-2">
                            <p className="text-sm text-slate-500 mb-2">No item found.</p>
                            {/* Check if onAddNew exists before rendering button */}
                            {onAddNew && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-emerald-700"
                                    onClick={() => {
                                        setOpen(false);
                                        onAddNew(searchTerm); // Pass the typed text
                                    }}>
                                    <PlusCircle className="h-4 w-4" /> Add "{searchTerm}" to Catalog
                                </Button>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {products
                                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((product) => (
                                    <CommandItem key={product.id} value={product.name} onSelect={() => { onSelect(product.id); setOpen(false); }} className="text-black cursor-pointer hover:bg-slate-100">
                                        <Check className={cn("mr-2 h-4 w-4", selectedId === product.id ? "opacity-100" : "opacity-0")} />
                                        <div className="flex flex-col"><span className="font-medium">{product.name}</span><span className="text-xs text-slate-500">Stock: {product.stock}</span></div>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}