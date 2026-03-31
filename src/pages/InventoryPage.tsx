import { useState, useMemo } from 'react';
import { Search, Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { Product, Category, StockAdjustment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const emptyProduct: Partial<Product> = {
  name: '', sku: '', category: '', description: '', price: 0, cost: 0, taxRate: 19.25, barcode: '', image: '', trackInventory: true, stock: 0, lowStockThreshold: 5, active: true, storeId: 'store-1',
};

export default function InventoryPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState(() => getData<Product[]>('products'));
  const [categories, setCategories] = useState(() => getData<Category[]>('categories'));
  const [adjustments, setAdjustments] = useState(() => getData<StockAdjustment[]>('stockAdjustments'));
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product>>(emptyProduct);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<Partial<Category>>({ name: '', color: '#0F766E' });
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [adjForm, setAdjForm] = useState({ productId: '', type: 'received' as StockAdjustment['type'], quantity: 0, reason: '' });

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'all' || p.category === catFilter;
    return ms && mc;
  });

  const saveProduct = () => {
    if (!editProduct.name) return;
    const isNew = !editProduct.id;
    const product: Product = {
      ...(emptyProduct as Product),
      ...editProduct,
      id: editProduct.id || `prod-${Math.random().toString(36).slice(2)}`,
      sku: editProduct.sku || `SKU-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    };
    const updated = isNew ? [...products, product] : products.map(p => p.id === product.id ? product : p);
    setProducts(updated);
    setData('products', updated);
    setShowForm(false);
    setEditProduct(emptyProduct);
    toast({ title: isNew ? 'Product created' : 'Product updated' });
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    setData('products', updated);
    toast({ title: 'Product deleted' });
  };

  const saveCat = () => {
    if (!editCat.name) return;
    const isNew = !editCat.id;
    const cat: Category = { id: editCat.id || `cat-${Math.random().toString(36).slice(2)}`, name: editCat.name!, color: editCat.color || '#0F766E' };
    const updated = isNew ? [...categories, cat] : categories.map(c => c.id === cat.id ? cat : c);
    setCategories(updated);
    setData('categories', updated);
    setShowCatForm(false);
    setEditCat({ name: '', color: '#0F766E' });
    toast({ title: isNew ? 'Category created' : 'Category updated' });
  };

  const deleteCat = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    setData('categories', updated);
    toast({ title: 'Category deleted' });
  };

  const saveAdjustment = () => {
    if (!adjForm.productId) return;
    const p = products.find(pr => pr.id === adjForm.productId);
    const adj: StockAdjustment = {
      id: `adj-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(),
      productId: adjForm.productId,
      productName: p?.name || '',
      type: adjForm.type,
      quantity: adjForm.type === 'removed' ? -Math.abs(adjForm.quantity) : Math.abs(adjForm.quantity),
      reason: adjForm.reason,
      employee: 'Current User',
    };
    const newAdj = [adj, ...adjustments];
    setAdjustments(newAdj);
    setData('stockAdjustments', newAdj);
    // Update product stock
    if (p) {
      const newStock = Math.max(0, p.stock + adj.quantity);
      const updatedProducts = products.map(pr => pr.id === p.id ? { ...pr, stock: newStock } : pr);
      setProducts(updatedProducts);
      setData('products', updatedProducts);
    }
    setShowAdjForm(false);
    setAdjForm({ productId: '', type: 'received', quantity: 0, reason: '' });
    toast({ title: 'Stock adjusted' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button className="gap-2" onClick={() => { setEditProduct(emptyProduct); setShowForm(true); }}><Plus className="h-4 w-4" />Add Product</Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="adjustments">Stock Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">SKU</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Price</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                        <td className="p-3">{categories.find(c => c.id === p.category)?.name}</td>
                        <td className="p-3 text-right">${p.price.toFixed(2)}</td>
                        <td className="p-3 text-right text-muted-foreground">${p.cost.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <span className={p.stock <= p.lowStockThreshold ? 'text-destructive font-medium' : ''}>{p.stock}</span>
                        </td>
                        <td className="p-3 text-center"><Badge variant={p.active ? 'default' : 'secondary'}>{p.active ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(p); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete {p.name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteProduct(p.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => { setEditCat({ name: '', color: '#0F766E' }); setShowCatForm(true); }}><Plus className="h-4 w-4" />Add Category</Button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: c.color }} />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{products.filter(p => p.category === c.id).length} products</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCat(c); setShowCatForm(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCat(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setShowAdjForm(true)}><Plus className="h-4 w-4" />New Adjustment</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-right p-3 font-medium">Qty</th>
                  <th className="text-left p-3 font-medium">Reason</th>
                  <th className="text-left p-3 font-medium">Employee</th>
                </tr></thead>
                <tbody>
                  {adjustments.map(a => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="p-3 text-muted-foreground">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="p-3">{a.productName}</td>
                      <td className="p-3 capitalize"><Badge variant="secondary">{a.type}</Badge></td>
                      <td className="p-3 text-right font-medium">{a.quantity > 0 ? '+' : ''}{a.quantity}</td>
                      <td className="p-3 text-muted-foreground">{a.reason}</td>
                      <td className="p-3">{a.employee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editProduct.id ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} /></div>
              <div><Label>SKU</Label><Input value={editProduct.sku} onChange={e => setEditProduct({ ...editProduct, sku: e.target.value })} placeholder="Auto-generated" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={editProduct.category} onValueChange={v => setEditProduct({ ...editProduct, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Barcode</Label><Input value={editProduct.barcode} onChange={e => setEditProduct({ ...editProduct, barcode: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Selling Price *</Label><Input type="number" min="0" step="0.01" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Cost Price</Label><Input type="number" min="0" step="0.01" value={editProduct.cost} onChange={e => setEditProduct({ ...editProduct, cost: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Tax Rate (%)</Label><Input type="number" min="0" step="0.01" value={editProduct.taxRate} onChange={e => setEditProduct({ ...editProduct, taxRate: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2"><Switch checked={editProduct.trackInventory} onCheckedChange={v => setEditProduct({ ...editProduct, trackInventory: v })} /><Label>Track Inventory</Label></div>
              <div className="flex items-center gap-2"><Switch checked={editProduct.active} onCheckedChange={v => setEditProduct({ ...editProduct, active: v })} /><Label>Active</Label></div>
            </div>
            {editProduct.trackInventory && (
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Stock Qty</Label><Input type="number" min="0" value={editProduct.stock} onChange={e => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Low Stock Threshold</Label><Input type="number" min="0" value={editProduct.lowStockThreshold} onChange={e => setEditProduct({ ...editProduct, lowStockThreshold: parseInt(e.target.value) || 0 })} /></div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={saveProduct}>Save Product</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCatForm} onOpenChange={setShowCatForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editCat.id ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editCat.name} onChange={e => setEditCat({ ...editCat, name: e.target.value })} /></div>
            <div><Label>Color</Label><Input type="color" value={editCat.color} onChange={e => setEditCat({ ...editCat, color: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCatForm(false)}>Cancel</Button>
              <Button onClick={saveCat}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjForm} onOpenChange={setShowAdjForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Stock Adjustment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select value={adjForm.productId} onValueChange={v => setAdjForm({ ...adjForm, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={adjForm.type} onValueChange={v => setAdjForm({ ...adjForm, type: v as StockAdjustment['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" min="1" value={adjForm.quantity} onChange={e => setAdjForm({ ...adjForm, quantity: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Reason</Label><Input value={adjForm.reason} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdjForm(false)}>Cancel</Button>
              <Button onClick={saveAdjustment}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
