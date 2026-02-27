import { useState, useEffect } from 'react';
import { Product, Sale } from '../types';

const PRODUCTS_KEY = 'local_products';
const SALES_KEY = 'local_sales';

export function useLocalStorage() {
  // Save products to localStorage
  const saveProducts = (products: Product[]) => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      localStorage.setItem(`${PRODUCTS_KEY}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  };

  // Load products from localStorage
  const loadProducts = (): Product[] | null => {
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      return null;
    }
  };

  // Save sales to localStorage
  const saveSales = (sales: Sale[]) => {
    try {
      localStorage.setItem(SALES_KEY, JSON.stringify(sales));
      localStorage.setItem(`${SALES_KEY}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error saving sales to localStorage:', error);
    }
  };

  // Load sales from localStorage
  const loadSales = (): Sale[] | null => {
    try {
      const stored = localStorage.getItem(SALES_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading sales from localStorage:', error);
      return null;
    }
  };

  // Update single product in localStorage
  const updateProductInStorage = (productId: string, updates: Partial<Product>) => {
    const products = loadProducts();
    if (products) {
      const updated = products.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      );
      saveProducts(updated);
    }
  };

  // Add sale to localStorage
  const addSaleToStorage = (sale: Sale) => {
    const sales = loadSales() || [];
    sales.unshift(sale);
    saveSales(sales);
  };

  // Clear all local data
  const clearLocalData = () => {
    try {
      localStorage.removeItem(PRODUCTS_KEY);
      localStorage.removeItem(`${PRODUCTS_KEY}_timestamp`);
      localStorage.removeItem(SALES_KEY);
      localStorage.removeItem(`${SALES_KEY}_timestamp`);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  };

  // Get last sync timestamp
  const getLastSync = (type: 'products' | 'sales'): number | null => {
    try {
      const key = type === 'products' ? PRODUCTS_KEY : SALES_KEY;
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      return timestamp ? parseInt(timestamp) : null;
    } catch {
      return null;
    }
  };

  return {
    saveProducts,
    loadProducts,
    saveSales,
    loadSales,
    updateProductInStorage,
    addSaleToStorage,
    clearLocalData,
    getLastSync,
  };
}
