import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { initialProducts } from './initialData'

export interface Product {
    id: string; name: string; sku: string; category: string; brand: string; manufacturer: string;
    stock: number; minLevel: number; purchasePrice: number; sellingPrice: number;
    baseUnit: string; alternateUnits: { name: string; factor: number; }[]
}

// TRANSACTION (Completed History)
export interface Transaction {
    id: string; date: string; documentDate: string;
    type: 'IN' | 'OUT'; documentType: 'INVOICE' | 'CHALLAN';
    documentNumber: string; partyName: string;
    items: { productId: string; productName: string; quantity: number; unit: string; conversionFactor: number; finalQuantity: number; price: number; }[];
    totalAmount: number;
}

// NEW: ORDER (Pending Pipeline)
export interface Order {
    id: string;
    date: string;
    expectedDate: string; // Kyare aavse/jase
    type: 'PURCHASE' | 'SALES'; // PURCHASE = PO, SALES = SO
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    partyName: string;
    orderNumber: string; // PO No. / SO No.
    items: { productId: string; quantity: number; unit: string; factor: number; price: number; }[];
    totalAmount: number;
}

interface InventoryState {
    products: Product[];
    transactions: Transaction[];
    orders: Order[]; // <-- New List

    addProduct: (product: Product) => void;
    updateProduct: (id: string, data: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, txn: Transaction) => void;

    // NEW ORDER ACTIONS
    addOrder: (order: Order) => void;
    updateOrderStatus: (id: string, status: 'COMPLETED' | 'CANCELLED') => void;
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set) => ({
            products: initialProducts,
            transactions: [],
            orders: [], // Initial Empty

            addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
            updateProduct: (id, d) => set((s) => ({ products: s.products.map(p => p.id === id ? { ...p, ...d } : p) })),
            deleteProduct: (id) => set((s) => ({ products: s.products.filter(p => p.id !== id) })),

            addTransaction: (transaction) => set((state) => {
                const updatedProducts = state.products.map(product => {
                    const itemInBill = transaction.items.find(i => i.productId === product.id);
                    if (itemInBill) {
                        return {
                            ...product,
                            stock: transaction.type === 'IN'
                                ? product.stock + itemInBill.finalQuantity
                                : product.stock - itemInBill.finalQuantity
                        };
                    }
                    return product;
                });
                return { products: updatedProducts, transactions: [transaction, ...state.transactions] };
            }),

            updateTransaction: (id, updatedTxn) => set((state) => { /* ... Junu update logic ... */ return state; }), // (Tame updateTransaction nu logic ahiya rakhjo je aapne pehla karyu hatu)

            // --- NEW ACTIONS ---
            addOrder: (order) => set((state) => ({
                orders: [order, ...state.orders]
            })),

            updateOrderStatus: (id, status) => set((state) => ({
                orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
            }))
        }),
        { name: 'rigel-nexus-erp-v8-orders', storage: createJSONStorage(() => localStorage) } // Version 8
    )
)