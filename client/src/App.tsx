import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // States for storing the picking and packing list data
  const [pickingList, setPickingList] = useState<Record<string, number>>({});
  const [pickedItems, setPickedItems] = useState<string[]>([]); // Store picked item IDs
  const [packingList, setPackingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  // Fetch the data from the API
  const fetchAPI = async () => {
    try {
      // Fetch picking list
      const pickingResponse = await axios.get('http://localhost:8080/api/picking-list');
      setPickingList(pickingResponse.data);

      // Fetch packing list
      const packingResponse = await axios.get('http://localhost:8080/api/packing-list');
      setPackingList(packingResponse.data);

      setLoading(false); // Data fetched successfully
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  // Fetch the data on component mount
  useEffect(() => {
    fetchAPI();
  }, []);

  // Function to handle marking an item as shipped
  const markAsShipped = async (orderId: number) => {
    try {
      // Simulate a delay to mock an API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate success response
      setPackingList(packingList.filter(order => order.orderId !== orderId));
      
      console.log(`Order ${orderId} marked as shipped.`);
    } catch (error) {
      console.error('Error marking item as shipped', error);
    }
  };

  const handlePick = (itemId: any) => {
    if (pickedItems.includes(itemId)) {
      setPickedItems(pickedItems.filter((id) => id !== itemId));
    } else {
      setPickedItems([...pickedItems, itemId]);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Warehouse Management System</h1>

      {/* Picking List Section */}
      <section>
        <h2>Picking List</h2>
        <ul>
          {Object.entries(pickingList).map(([item, count]) => (
            <li key={item}>
              <input
                type="checkbox"
                checked={pickedItems.includes(item)}
                onChange={() => handlePick(item)}
              />
              {item} x {count}
            </li>
          ))}
        </ul>
      </section>

      {/* Packing List Section */}
      <section>
        <h2>Packing List</h2>
        {packingList.map((order) => (
          <div key={order.orderId} className="order">
            <h3>Order #{order.orderId}</h3>
            <p>Customer: {order.customer.name}</p>
            <p>Shipping Address: {order.shippingAddress}</p>
            <p>Order Date: {order.orderDate}</p>
            <h4>Items</h4>
            <ul>
              {order.items.map((lineItem: any) => (
                <li key={lineItem.lineItem}>
                  <strong>{lineItem.lineItem}</strong>
                  <ul>
                    {lineItem.subItems.map((subItem: string, index: number) => (
                      <li key={index}>{subItem}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <button onClick={() => markAsShipped(order.orderId)}>Mark as Shipped</button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
