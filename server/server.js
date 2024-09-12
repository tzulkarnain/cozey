const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');

const corsOptions = {
  origin: ['http://localhost:5173'],
};
app.use(cors(corsOptions));

// Mock Orders and Products Data
const orders = JSON.parse(fs.readFileSync('./data/orders.json', 'utf8'));
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));


// Get Picking List
app.get('/api/picking-list', (req, res) => {
  const pickingList = {};
  
  orders.forEach(order => {
    order.lineItems.forEach(lineItem => {
      const subItems = products[lineItem.productId];
      subItems.forEach(item => {
        pickingList[item] = (pickingList[item] || 0) + 1;
      });
    });
  });
  
  res.json(pickingList);
});

// Get Packing List
app.get('/api/packing-list', (req, res) => {
  const packingList = orders.map(order => {
    const packedOrder = { 
      orderId: order.orderId, 
      customer: order.customer, 
      shippingAddress: order.shippingAddress, 
      orderDate: order.orderDate, 
      items: [] 
    };
    
    order.lineItems.forEach(lineItem => {
      const subItems = products[lineItem.productId];
      packedOrder.items.push({
        lineItem: lineItem.productName,
        subItems
      });
    });
    
    return packedOrder;
  });
  
  res.json(packingList);
});

app.listen(8080, () => {
  console.log('Server started on port 8080');
});
