import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
    id: string
    name: string
    sku: string
    category: string
    stock: number
    unit: string // e.g., Pcs, Box, Kg
    minLevel: number // Stock low hoy to alert mate
    price: number;
}

interface InventoryState {
    products: Product[]
    addProduct: (product: Product) => void
    deleteProduct: (id: string) => void
    updateStock: (id: string, amount: number) => void
}

export const useInventoryStore = create<InventoryState>()(

    persist(
        (set) => ({
            products: [
                {
                    id: '1',
                    name: 'Hex Bolt M12 x 50mm',
                    sku: 'HB-M12-50',
                    category: 'Fasteners',
                    stock: 450,
                    unit: 'Pcs',
                    minLevel: 100,
                    price: 15
                },
                {
                    id: '2',
                    name: 'Safety Gloves (Nitrile)',
                    sku: 'SG-NT-L',
                    category: 'Safety',
                    stock: 12,
                    unit: 'Pairs',
                    minLevel: 20,
                    price: 85
                },
                {
                    id: '3',
                    name: 'Cutting Wheel 4"',
                    sku: 'CW-04-BOSCH',
                    category: 'Consumables',
                    stock: 85,
                    unit: 'Box',
                    minLevel: 10,
                    price: 450
                },
            ],
            addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
            deleteProduct: (id) => set((state) => ({
                products: state.products.filter(p => p.id !== id)
            })),
            updateStock: (id, amount) => set((state) => ({
                products: state.products.map(p => p.id === id ? { ...p, stock: p.stock + amount } : p)
            }))
        }),
        { name: 'rigel-nexus-storage' }
    )
)