'use client';

import React, { useState } from 'react';
import { ProductDiscovery } from '@/sanity/components/ProductDiscovery';
import { PatchEvent } from 'sanity';

export default function ProductDiscoveryTestPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    supplierUrl: '',
    supplierName: '',
    importedFromAlibaba: false
  });

  const handleChange = (patch: PatchEvent) => {
    // Simulate form updates
    console.log('Form updated with patch:', patch);
    
    // In a real implementation, this would update the form fields
    // For now, we'll just log the changes
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Product Discovery Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Discovery Component */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Product Discovery Tool</h2>
          <ProductDiscovery onChange={handleChange} value="" />
        </div>

        {/* Form Preview */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Form Preview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Product title will appear here"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Product description will appear here"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier URL</label>
              <input
                type="url"
                value={formData.supplierUrl}
                onChange={(e) => setFormData({...formData, supplierUrl: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Supplier URL will appear here"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Supplier name will appear here"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.importedFromAlibaba}
                onChange={(e) => setFormData({...formData, importedFromAlibaba: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Imported from Alibaba
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 