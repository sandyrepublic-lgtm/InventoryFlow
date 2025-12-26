export type EntryStatus = 'empty' | 'stocked' | 'sold';

export interface Entry {
  id: string;
  status: EntryStatus;
}

export interface ColorVariant {
  id: string;
  name: string;
  entries: Entry[];
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  variants: ColorVariant[];
  updatedAt: string;
}

export interface InventoryData {
  products: Product[];
}