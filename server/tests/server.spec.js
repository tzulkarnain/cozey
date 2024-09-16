import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Mock data
const mockOrders = [
  {
    orderId: 1,
    orderTotal: 100,
    orderDate: '2024-09-01',
    shippingAddress: '123 Test St',
    customer: 'John Doe',
    lineItems: [
      { productId: 'prod1', productName: 'Product 1' },
      { productId: 'prod2', productName: 'Product 2' }
    ]
  }
];

const mockProducts = {
  'prod1': ['item1', 'item2'],
  'prod2': ['item3']
};

// Mock fs.readFileSync
vi.mock('fs', () => ({
  readFileSync: (path) => {
    if (path.includes('orders.json')) {
      return JSON.stringify(mockOrders);
    } else if (path.includes('products.json')) {
      return JSON.stringify(mockProducts);
    }
    return '';
  }
}));

const app = express();
const corsOptions = {
  origin: ['http://localhost:5173'],
};
app.use(cors(corsOptions));

app.get('/api/picking-list', (req, res) => {
  const pickingList = {};
  
  mockOrders.forEach(order => {
    order.lineItems.forEach(lineItem => {
      const subItems = mockProducts[lineItem.productId];
      subItems.forEach(item => {
        pickingList[item] = (pickingList[item] || 0) + 1;
      });
    });
  });
  
  res.json(pickingList);
});

app.get('/api/packing-list', (req, res) => {
  const packingList = mockOrders.map(order => {
    const packedOrder = { 
      orderId: order.orderId, 
      customer: order.customer, 
      shippingAddress: order.shippingAddress, 
      orderDate: order.orderDate, 
      items: [] 
    };
    
    order.lineItems.forEach(lineItem => {
      const subItems = mockProducts[lineItem.productId];
      packedOrder.items.push({
        lineItem: lineItem.productName,
        subItems
      });
    });
    
    return packedOrder;
  });
  
  res.json(packingList);
});

beforeAll(() => {
  app.listen(8080);
});

afterAll(() => {
  // Cleanup actions, if needed
});

describe('GET /api/picking-list', () => {
  it('should return the correct picking list', async () => {
    const response = await request(app).get('/api/picking-list');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      item1: 1,
      item2: 1,
      item3: 1
    });
  });
});

describe('GET /api/packing-list', () => {
  it('should return the correct packing list', async () => {
    const response = await request(app).get('/api/packing-list');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        orderId: 1,
        customer: 'John Doe',
        shippingAddress: '123 Test St',
        orderDate: '2024-09-01',
        items: [
          { lineItem: 'Product 1', subItems: ['item1', 'item2'] },
          { lineItem: 'Product 2', subItems: ['item3'] }
        ]
      }
    ]);
  });
});
