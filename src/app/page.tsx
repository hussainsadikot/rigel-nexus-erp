"use client"

import { useState, useEffect } from "react";
import { useInventoryStore, Product, Transaction, Order } from "@/store/useInventoryStore";
import { AddProductModal } from "@/components/AddProductModal";
import { EditProductModal } from "@/components/EditProductModal";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { BulkInwardModal } from "@/components/BulkInwardModal";
import { BulkOutwardModal } from "@/components/BulkOutwardModal";
import { CreateOrderModal } from "@/components/CreateOrderModal";
import { ReportsTab } from "@/components/ReportsTab";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Package, AlertTriangle, Boxes, Trash2, Search, Filter, History, ArrowDownCircle, ArrowUpCircle, Pencil, Clock, ClipboardList, ShoppingCart, CheckCircle, Calendar, FileText } from "lucide-react";

export default function Dashboard() {
  const { products, transactions = [], orders = [], deleteProduct, addTransaction, updateOrderStatus } = useInventoryStore();

  const [isMounted, setIsMounted] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // --- NEW: 2 Separate Dates State ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]); // Physical Movement
  const [docDate, setDocDate] = useState(""); // Paper Bill Date

  const [historySearch, setHistorySearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const initiateOrderConversion = (order: Order) => {
    setSelectedOrder(order);
    setTxnDate(new Date().toISOString().split('T')[0]); // Aaj ni tarikh (Transaction)
    setDocDate(order.date); // Default PO date as Document date (User can change)
  }

  const processOrderConversion = () => {
    if (!selectedOrder) return;
    if (!docDate) { alert("Please select Bill/Document Date"); return; }

    const txn: Transaction = {
      id: crypto.randomUUID(),
      date: txnDate,       // <-- PHYSICAL DATE (History ma aa dekhase)
      documentDate: docDate, // <-- BILL DATE (Record mate)
      type: selectedOrder.type === 'PURCHASE' ? 'IN' : 'OUT',
      documentType: 'INVOICE',
      documentNumber: selectedOrder.orderNumber,
      partyName: selectedOrder.partyName,
      items: selectedOrder.items.map(i => {
        const prod = products.find(p => p.id === i.productId);
        return {
          productId: i.productId,
          productName: prod?.name || "Unknown",
          quantity: i.quantity,
          unit: i.unit,
          conversionFactor: i.factor,
          finalQuantity: i.quantity * i.factor,
          price: i.price
        };
      }),
      totalAmount: selectedOrder.totalAmount
    };

    addTransaction(txn);
    updateOrderStatus(selectedOrder.id, 'COMPLETED');
    setSelectedOrder(null);
  };

  // ... (getPipelineStock function same as before) ...
  const getPipelineStock = (productId: string) => {
    let incoming = 0; let committed = 0;
    orders.forEach(order => {
      if (order.status === 'PENDING') {
        const item = order.items.find(i => i.productId === productId);
        if (item) {
          const totalQty = item.quantity * item.factor;
          if (order.type === 'PURCHASE') incoming += totalQty;
          if (order.type === 'SALES') committed += totalQty;
        }
      }
    });
    return { incoming, committed };
  }

  // Filters same as before...
  const filteredTransactions = transactions.filter(txn => txn.partyName.toLowerCase().includes(historySearch.toLowerCase()) || txn.documentNumber.toLowerCase().includes(historySearch.toLowerCase()));
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const lowStockItems = products.filter(p => p.stock <= p.minLevel);
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const getLastActivity = (productId: string) => {
    if (!transactions || transactions.length === 0) return null;
    const productTxns = transactions.filter(t => t.items && t.items.some(item => item.productId === productId));
    if (productTxns.length === 0) return null;
    return productTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">

      {/* MODALS */}
      <EditProductModal isOpen={!!editingProduct} product={editingProduct} onClose={() => setEditingProduct(null)} />
      <EditTransactionModal isOpen={!!editingTransaction} transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />

      {/* --- NEW: ORDER CONVERSION DIALOG WITH 2 DATES --- */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white text-black border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {selectedOrder?.type === 'PURCHASE' ? 'Receive Stock (Inward)' : 'Dispatch Stock (Outward)'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-slate-50 rounded-md border text-sm text-slate-700">
              <p><strong>Order No:</strong> {selectedOrder?.orderNumber}</p>
              <p><strong>Party:</strong> {selectedOrder?.partyName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DATE 1: Transaction Date (Physical) */}
              <div className="space-y-2">
                <Label className="text-emerald-700 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {selectedOrder?.type === 'PURCHASE' ? 'Received Date' : 'Dispatch Date'}
                </Label>
                <Input type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} className="text-black font-medium border-slate-300" />
                <p className="text-[10px] text-slate-500">Date when stock physically moved.</p>
              </div>

              {/* DATE 2: Document Date (Paper) */}
              <div className="space-y-2">
                <Label className="text-blue-700 font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Bill / Invoice Date
                </Label>
                <Input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className="text-black font-medium border-slate-300" />
                <p className="text-[10px] text-slate-500">Date printed on the Bill.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)} className="text-slate-700">Cancel</Button>
            <Button className={selectedOrder?.type === 'PURCHASE' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} onClick={processOrderConversion}>Confirm & Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HEADER & TABS (Same as before) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Rigel Nexus ERP</h1><p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Inventory & Traceability System</p></div>
        <div className="flex flex-wrap gap-2">
          <CreateOrderModal type="PURCHASE" />
          <CreateOrderModal type="SALES" />
          <div className="w-px h-10 bg-slate-300 mx-2 hidden md:block"></div>
          <AddProductModal />
          <BulkInwardModal />
          <BulkOutwardModal />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[800px] mb-4 bg-slate-200 p-1 rounded-lg">
          <TabsTrigger value="overview" className="text-slate-600 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="relative text-slate-600 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
            Pipeline
            {pendingOrders.length > 0 && <span className="ml-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingOrders.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-slate-600 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">History</TabsTrigger>
          <TabsTrigger value="reports" className="text-slate-600 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Same Overview Content */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-sm border-none bg-white"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-semibold text-slate-600">Total Items</CardTitle><Package className="h-4 w-4 text-slate-400" /></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">{products.length}</div></CardContent></Card>
            <Card className={`shadow-sm border-l-4 ${lowStockItems.length > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-emerald-50'}`}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className={`text-sm font-semibold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{lowStockItems.length > 0 ? 'Attention Needed' : 'System Healthy'}</CardTitle><AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? 'text-red-500' : 'text-emerald-500'}`} /></CardHeader><CardContent><div className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{lowStockItems.length} <span className="text-sm font-normal">Low Stock Items</span></div></CardContent></Card>
            <Card className="shadow-sm border-none bg-white"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-semibold text-slate-600">Total Valuation</CardTitle><Boxes className="h-4 w-4 text-slate-400" /></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">₹{products.reduce((acc, p) => acc + (p.purchasePrice * p.stock), 0).toLocaleString()}</div></CardContent></Card>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative w-full md:w-1/3"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" /><Input placeholder="Search name or SKU..." className="pl-9 text-black font-medium border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="flex items-center gap-2 w-full md:w-auto"><Filter className="h-4 w-4 text-slate-500" /><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[180px] text-black border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat} value={cat} className="text-black">{cat}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900 w-[20%]">Product</TableHead>
                  <TableHead className="font-bold text-slate-900 w-[15%]">Physical Stock</TableHead>
                  <TableHead className="font-bold text-blue-700 w-[10%]">Incoming (PO)</TableHead>
                  <TableHead className="font-bold text-orange-700 w-[10%]">Committed (SO)</TableHead>
                  <TableHead className="font-bold text-slate-900 w-[15%]">Last Activity</TableHead>
                  <TableHead className="font-bold text-slate-900 w-[10%]">Status</TableHead>
                  <TableHead className="font-bold text-right text-slate-900 w-[10%]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center h-24 text-slate-500">No products found.</TableCell></TableRow>) : (
                  filteredProducts.map((product) => {
                    const lastTxn = getLastActivity(product.id);
                    const { incoming, committed } = getPipelineStock(product.id);
                    const available = product.stock - committed;
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                        <TableCell><div className="font-bold text-slate-900">{product.name}</div><div className="text-xs text-slate-500 font-mono">SKU: {product.sku}</div></TableCell>
                        <TableCell>
                          <div className="flex items-baseline gap-1"><span className="text-xl font-bold text-slate-900">{product.stock}</span><span className="text-sm text-slate-500">{product.baseUnit}</span></div>
                          <div className="text-[11px] font-medium text-slate-500 mt-1">Available: <span className={available < 0 ? "text-red-600 font-bold" : "text-emerald-700 font-bold"}>{available}</span></div>
                        </TableCell>
                        <TableCell>{incoming > 0 ? (<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><ClipboardList className="w-3 h-3" /> +{incoming}</Badge>) : <span className="text-slate-300 text-sm">-</span>}</TableCell>
                        <TableCell>{committed > 0 ? (<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1"><ShoppingCart className="w-3 h-3" /> -{committed}</Badge>) : <span className="text-slate-300 text-sm">-</span>}</TableCell>
                        <TableCell>{lastTxn ? (<div className="flex flex-col"><div className="flex items-center gap-1 font-medium text-sm text-slate-700">{lastTxn.type === 'IN' ? <ArrowDownCircle className="w-3 h-3 text-emerald-600" /> : <ArrowUpCircle className="w-3 h-3 text-red-600" />}{lastTxn.date}</div><div className="text-[10px] text-slate-500">{lastTxn.type === 'IN' ? 'Received' : 'Dispatched'} via {lastTxn.documentType}</div></div>) : (<div className="flex items-center gap-1 text-slate-400 text-sm"><Clock className="w-3 h-3" /> No History</div>)}</TableCell>
                        <TableCell>{product.stock <= product.minLevel ? <Badge variant="destructive" className="animate-pulse">Low Stock</Badge> : <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">OK</Badge>}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 mr-1" onClick={() => setEditingProduct(product)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => { if (confirm('Delete?')) deleteProduct(product.id); }}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    )
                  }))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          {/* Same Orders Content */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader><CardTitle className="flex items-center gap-2 text-slate-800"><ClipboardList className="h-5 w-5" /> Pipeline (Pending Orders)</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-100"><TableRow><TableHead className="text-black font-bold">Date</TableHead><TableHead className="text-black font-bold">Type</TableHead><TableHead className="text-black font-bold">Order No</TableHead><TableHead className="text-black font-bold">Party</TableHead><TableHead className="text-black font-bold">Items</TableHead><TableHead className="text-right text-black font-bold">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pendingOrders.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center h-24 text-slate-500">No pending orders.</TableCell></TableRow>) : (
                      pendingOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell><div className="font-medium text-slate-900">{order.date}</div><div className="text-[10px] text-slate-500">Exp: {order.expectedDate || 'N/A'}</div></TableCell>
                          <TableCell><Badge className={order.type === 'PURCHASE' ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-orange-100 text-orange-800 border-orange-200"}>{order.type === 'PURCHASE' ? 'PO' : 'SO'}</Badge></TableCell>
                          <TableCell className="text-slate-900 font-mono text-sm">{order.orderNumber}</TableCell>
                          <TableCell className="text-slate-900 font-medium">{order.partyName}</TableCell>
                          <TableCell><div className="text-xs text-slate-700">{order.items.length} Items ({order.items.map(i => products.find(p => p.id === i.productId)?.name).slice(0, 2).join(", ")}...)</div></TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" className={order.type === 'PURCHASE' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-800 hover:bg-slate-900 text-white"} onClick={() => initiateOrderConversion(order)}>
                              {order.type === 'PURCHASE' ? <><CheckCircle className="w-3 h-3 mr-1" /> Receive Stock</> : <><CheckCircle className="w-3 h-3 mr-1" /> Dispatch</>}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2 text-slate-800"><History className="h-5 w-5" /> Transaction Log</CardTitle><div className="relative w-64"><Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" /><Input placeholder="Search Bill No or Party..." className="pl-8 h-9 text-black border-slate-200" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} /></div></div></CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-100"><TableRow><TableHead className="text-black font-bold">Transaction Date</TableHead><TableHead className="text-black font-bold">Doc No & Date</TableHead><TableHead className="text-black font-bold">Party</TableHead><TableHead className="text-black font-bold">Items Summary</TableHead><TableHead className="text-right text-black font-bold">Amount</TableHead><TableHead className="text-right text-black font-bold">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredTransactions.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-slate-50 border-b border-slate-100">
                        {/* FIX: Showing Transaction Date Main, Document Date small */}
                        <TableCell>
                          <div className="font-bold text-slate-900">{txn.date}</div>
                          <Badge className={`mt-1 text-[10px] ${txn.type === 'IN' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>{txn.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-slate-900 font-mono text-sm font-bold">{txn.documentNumber}</div>
                          <div className="text-[11px] text-slate-500">Bill Dt: {txn.documentDate || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-slate-900 font-medium">{txn.partyName}</TableCell>
                        <TableCell><div className="text-xs text-slate-700">{txn.items.length} Items ({txn.items.map(i => i.productName).slice(0, 2).join(", ")}{txn.items.length > 2 && "..."})</div></TableCell>
                        <TableCell className="text-right font-bold text-slate-900">₹{txn.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setEditingTransaction(txn)} className="border-slate-300 text-slate-700 hover:bg-slate-50">Edit Bill</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

      </Tabs>
    </main>
  );
}