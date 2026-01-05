"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, PlusCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Product } from "@/store/useInventoryStore"

interface Props {
    products: Product[]
    selectedId: string
    onSelect: (id: string) => void
    onAddNew?: (name: string) => void
}

export function SearchableProductSelect({ products, selectedId, onSelect, onAddNew }: Props) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const selectedProduct = products.find((p) => p.id === selectedId)

    const filteredProducts = useMemo(() => {
        // LOGIC CHANGE: Jo kai lakhyu NA hoy, to kai na batavo
        if (!searchTerm) return [];

        // Jo lakhyu hoy, to j filter karo
        const matches = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return matches.slice(0, 50); // Max 50 results
    }, [products, searchTerm]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-black bg-white border-slate-300 truncate hover:bg-slate-50"
                >
                    {selectedProduct ? `${selectedProduct.name}` : "Search item..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[350px] p-0 bg-white" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Type name or SKU to search..."
                        className="text-black"
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>

                        {/* SCENARIO 1: Kai lakhyu nathi (Empty State) */}
                        {searchTerm === "" && (
                            <div className="py-6 text-center text-sm text-slate-500">
                                <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p>Start typing to find products...</p>
                            </div>
                        )}

                        {/* SCENARIO 2: Lakhyu chhe pan item nathi mali */}
                        {searchTerm !== "" && filteredProducts.length === 0 && (
                            <div className="py-6 text-center text-sm">
                                <p className="text-slate-500 mb-2">No item found.</p>
                                {onAddNew && (
                                    <Button
                                        variant="outline"
                                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-2 mx-auto"
                                        onClick={() => {
                                            setOpen(false);
                                            onAddNew(searchTerm);
                                        }}>
                                        <PlusCircle className="h-4 w-4" /> Add "{searchTerm}" to Catalog
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* SCENARIO 3: Results mali gaya */}
                        <CommandGroup>
                            {filteredProducts.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => { onSelect(product.id); setOpen(false); }}
                                    className="text-black cursor-pointer hover:bg-slate-100 flex flex-col items-start gap-1 py-2"
                                >
                                    <div className="flex items-center w-full">
                                        <Check className={cn("mr-2 h-4 w-4 text-emerald-600", selectedId === product.id ? "opacity-100" : "opacity-0")} />
                                        <span className="font-semibold">{product.name}</span>
                                    </div>
                                    <div className="pl-6 text-xs text-slate-500 flex justify-between w-full">
                                        <span>SKU: {product.sku}</span>
                                        <span>Stock: {product.stock} {product.baseUnit}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}