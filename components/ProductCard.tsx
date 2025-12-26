import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronUp, Box } from 'lucide-react';
import { Product, ColorVariant, Entry, EntryStatus } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Note: In a real app we'd install this, but for this generated code I'll use a helper or Math.random if package not available.
// Actually, I'll use a simple helper in this file to avoid dependency issues in the generated block.

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ProductCardProps {
  product: Product;
  onUpdate: (updatedProduct: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onUpdate, onDelete }) => {
  const [newColorName, setNewColorName] = useState('');
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Status Colors Config
  const statusConfig: Record<EntryStatus, string> = {
    empty: 'bg-transparent border-2 border-dashed border-slate-300 hover:border-slate-400',
    stocked: 'bg-yellow-400 border-2 border-yellow-500 shadow-sm',
    sold: 'bg-emerald-500 border-2 border-emerald-600 shadow-sm',
  };

  const statusLabel: Record<EntryStatus, string> = {
    empty: 'Empty',
    stocked: 'In Stock',
    sold: 'Sold'
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const newVariant: ColorVariant = {
      id: generateId(),
      name: newColorName,
      entries: Array(5).fill(null).map(() => ({ id: generateId(), status: 'empty' })) // Start with 5 empty slots
    };
    onUpdate({
      ...product,
      variants: [...product.variants, newVariant]
    });
    setNewColorName('');
    setIsAddingColor(false);
  };

  const handleDeleteColor = (variantId: string) => {
    onUpdate({
      ...product,
      variants: product.variants.filter(v => v.id !== variantId)
    });
  };

  const handleEntryClick = (variantId: string, entryId: string, currentStatus: EntryStatus) => {
    // Cycle: Empty -> Stocked -> Sold -> Empty
    const nextStatus: Record<EntryStatus, EntryStatus> = {
      empty: 'stocked',
      stocked: 'sold',
      sold: 'empty'
    };

    const updatedVariants = product.variants.map(v => {
      if (v.id !== variantId) return v;
      return {
        ...v,
        entries: v.entries.map(e => {
          if (e.id !== entryId) return e;
          return { ...e, status: nextStatus[currentStatus] };
        })
      };
    });

    onUpdate({ ...product, variants: updatedVariants });
  };

  const handleAddEntry = (variantId: string) => {
    const updatedVariants = product.variants.map(v => {
      if (v.id !== variantId) return v;
      return {
        ...v,
        entries: [...v.entries, { id: generateId(), status: 'stocked' as EntryStatus }]
      };
    });
    onUpdate({ ...product, variants: updatedVariants });
  };

  const handleRemoveEntry = (variantId: string, entryId: string) => {
     const updatedVariants = product.variants.map(v => {
      if (v.id !== variantId) return v;
      return {
        ...v,
        entries: v.entries.filter(e => e.id !== entryId)
      };
    });
    onUpdate({ ...product, variants: updatedVariants });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      {/* Product Header */}
      <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <Box className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
          <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
            {product.variants.length} Colors
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDelete(product.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Variants List */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {product.variants.map(variant => (
            <div key={variant.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <h4 className="font-semibold text-slate-700 text-sm">{variant.name}</h4>
                  <div className="flex gap-2 text-[10px] font-medium text-slate-500 ml-2">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full"></div>{variant.entries.filter(e => e.status === 'stocked').length}</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div>{variant.entries.filter(e => e.status === 'sold').length}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteColor(variant.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-opacity px-2 py-1"
                >
                  Delete Color
                </button>
              </div>

              {/* Entries Grid/List */}
              <div className="flex flex-wrap gap-2 items-center">
                {variant.entries.map(entry => (
                  <div key={entry.id} className="relative group/entry">
                    <button
                      onClick={() => handleEntryClick(variant.id, entry.id, entry.status)}
                      className={`w-8 h-8 rounded-md transition-all duration-200 ${statusConfig[entry.status]}`}
                      title={`${statusLabel[entry.status]} (Click to cycle)`}
                    />
                    {/* Delete Entry Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEntry(variant.id, entry.id);
                      }}
                      className="absolute -top-1 -right-1 bg-white rounded-full shadow-md border border-slate-200 p-0.5 opacity-0 group-hover/entry:opacity-100 hover:text-red-500 transition-all scale-75"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Add Entry Button */}
                <button
                  onClick={() => handleAddEntry(variant.id)}
                  className="w-8 h-8 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                  title="Add Unit"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Color Form */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {isAddingColor ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color Name (e.g., Marine)"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddColor()}
                />
                <button
                  onClick={handleAddColor}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingColor(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColor(true)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Color Variant
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;