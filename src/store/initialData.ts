import { Product } from "./useInventoryStore";

export const initialProducts: Product[] = [
    {
        id: "p-1",
        name: "Hex Bolt M12 x 50mm",
        sku: "FAS-BOLT-M12-50",
        category: "Fasteners",
        brand: "Unbranded",
        manufacturer: "Local",
        stock: 500,
        minLevel: 100,
        purchasePrice: 12,
        sellingPrice: 18,

        // UNIT CONFIGURATION
        baseUnit: "Pcs",
        alternateUnits: [
            { name: "Box", factor: 50 },  // 1 Box = 50 Pcs
            { name: "Kg", factor: 20 }    // 1 Kg = 20 Pcs (Approx)
        ]
    },
    {
        id: "p-4",
        name: "Cement (OPC 53 Grade)",
        sku: "CON-CMT-ULT-53",
        category: "Construction",
        brand: "Ultratech",
        manufacturer: "Ultratech Cement Ltd",
        stock: 200,
        minLevel: 50,
        purchasePrice: 380,
        sellingPrice: 420,

        baseUnit: "Bags",
        alternateUnits: [] // Cement khali Bag ma j aave
    },
];