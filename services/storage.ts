import { Product } from '../types';
import { GOOGLE_SCRIPT_URL } from '../config';

const STORAGE_KEY = 'inventory_flow_data_v1';

// We now return a Promise because fetching from Google Sheets is asynchronous
export const loadInventory = async (): Promise<Product[]> => {
  // 1. Try Google Sheets if URL is configured
  if (GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Cache this data to local storage just in case
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error("Failed to load from Google Sheets, falling back to local storage", e);
    }
  }

  // 2. Fallback to Local Storage
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load local inventory", e);
    return [];
  }
};

export const saveInventory = async (products: Product[]): Promise<boolean> => {
  // Always save to local storage immediately for UI responsiveness
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }

  // If connected to cloud, sync in background
  if (GOOGLE_SCRIPT_URL) {
    try {
      // We use 'no-cors' mode if simply firing and forgetting, 
      // but for proper error handling standard POST is better.
      // Note: GAS requires following redirects for POST, which fetch handles automatically usually.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(products),
      });
      return true;
    } catch (e) {
      console.error("Failed to sync with Google Sheets", e);
      return false;
    }
  }
  return true;
};