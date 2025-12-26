import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Settings, Barcode, Sparkles, AlertCircle, RefreshCw, CheckCircle2, CloudOff } from 'lucide-react';
import { Product } from './types';
import { loadInventory, saveInventory } from './services/storage';
import ProductCard from './components/ProductCard';
import GeminiAssistant from './components/GeminiAssistant';
import { GOOGLE_SCRIPT_URL } from './config';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // App States
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  // Load data on mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const data = await loadInventory();
      setProducts(data);
      setIsLoading(false);
    };
    initData();
  }, []);

  // Save data on change (Debounced to prevent too many API calls)
  useEffect(() => {
    if (isLoading) return; // Don't save empty state on initial load

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      setSyncError(false);
      const success = await saveInventory(products);
      if (!success && GOOGLE_SCRIPT_URL) setSyncError(true);
      setIsSyncing(false);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [products, isLoading]);

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    const newProduct: Product = {
      id: generateId(),
      name: newProductName,
      variants: [],
      updatedAt: new Date().toISOString()
    };
    setProducts([newProduct, ...products]);
    setNewProductName('');
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Layers className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">InventoryFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Sync Status Indicator */}
            <div className="hidden sm:flex items-center mr-2">
               {isSyncing ? (
                 <span className="flex items-center text-xs text-slate-400 gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>
               ) : syncError ? (
                 <span className="flex items-center text-xs text-red-500 gap-1"><CloudOff className="w-3 h-3" /> Sync Failed</span>
               ) : GOOGLE_SCRIPT_URL ? (
                 <span className="flex items-center text-xs text-emerald-500 gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</span>
               ) : null}
            </div>

             <button
              onClick={() => setIsAiOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Insights
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Settings / Config Status */}
        {showSettings && (
          <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Application Settings
            </h3>
            
            {GOOGLE_SCRIPT_URL ? (
               <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                 <div>
                   <span className="font-semibold block">Cloud Sync Active</span>
                   Connected to Google Sheets via Webhook.
                 </div>
               </div>
            ) : (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100 flex items-start gap-2">
                 <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                 <div>
                   <span className="font-semibold block">Offline Mode</span>
                   Data is stored in your browser. To enable Google Sheets sync, add your Web App URL to <code>config.ts</code>.
                 </div>
               </div>
            )}
            
            <p className="mt-3 text-xs text-slate-500">
              Version 1.1 • {products.length} Products • {products.reduce((acc, p) => acc + p.variants.length, 0)} Variants
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
          </div>
          <button
            onClick={() => alert("Barcode scanning would integrate with the device camera here.")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Barcode className="w-5 h-5" />
            <span className="hidden sm:inline">Scan</span>
          </button>
          <button
            onClick={() => setIsAddingProduct(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Product</span>
          </button>
        </div>

        {/* Add Product Modal (Inline) */}
        {isAddingProduct && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Add New Product</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Product Name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
              />
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
              >
                Create
              </button>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="px-6 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500">Loading inventory...</p>
          </div>
        ) : (
          /* Product List */
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <Layers className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-500">No products found</p>
                <p className="text-sm text-slate-400">Add a product to get started</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* AI FAB for Mobile */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* AI Modal */}
      <GeminiAssistant 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        products={products} 
      />
    </div>
  );
};

export default App;