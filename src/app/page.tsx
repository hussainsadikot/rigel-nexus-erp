"use client"

import { useState } from "react"; // <-- State mate
import { useInventoryStore } from "@/store/useInventoryStore";
import { AddProductModal } from "@/components/AddProductModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // <-- Search input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // <-- Dropdown
import { Package, AlertTriangle, Boxes, Plus, Minus, Trash2, Search, Filter } from "lucide-react";

export default function Dashboard() {
  const { products, updateStock, deleteProduct } = useInventoryStore();

  // 1. Search ane Filter mate State banavyu
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // 2. Main Logic: Garni (Filter) Process
  const filteredProducts = products.filter((product) => {
    // Search match kare (Case insensitive: A = a)
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    // Category match kare
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const lowStockItems = products.filter(p => p.stock <= p.minLevel);

  // Categories nu unique list banavvu (Dropdown mate)
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Rigel Nexus ERP</h1>
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Inventory & Operations</p>
        </div>
        <AddProductModal />
      </div>

      {/* Summary Cards (Same as before) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Items</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{products.length}</div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-l-4 ${lowStockItems.length > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-emerald-50'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-semibold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {lowStockItems.length > 0 ? 'Attention Needed' : 'System Healthy'}
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {lowStockItems.length} <span className="text-sm font-normal">Low Stock Items</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Valuation</CardTitle>
            <Boxes className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₹{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTER BAR (New Section) */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by Name or SKU..."
            className="pl-9 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]  text-black">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="text-black">
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-black">
          Showing {filteredProducts.length} of {products.length} items
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" >
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-black">Item Details</TableHead>
              <TableHead className="font-bold text-black">Category</TableHead>
              <TableHead className="font-bold text-black text-center">Quick Actions</TableHead>
              <TableHead className="font-bold text-black text-right">Stock</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-right text-black">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Ahiya have 'filteredProducts' use thay chhe */}
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                  No items match your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{product.sku}</div>
                    <div className="text-xs text-slate-500">₹{product.price} / {product.unit}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-black">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => updateStock(product.id, -1)} disabled={product.stock <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => updateStock(product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg text-black">{product.stock}</TableCell>
                  <TableCell>
                    {product.stock <= product.minLevel ? (
                      <Badge variant="destructive" className="animate-pulse">Restock</Badge>
                    ) : (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">Good</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { if (confirm('Delete?')) deleteProduct(product.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}