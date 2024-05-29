// src/components/OrderingInfo.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import OrderingABI from '../ABIs/Ordering_ABI.json';
import { CONTRACT_ADDRESSES } from '../contracts';

interface OrderingInfoProps {
  web3: Web3;
}

const OrderingInfo: React.FC<OrderingInfoProps> = ({ web3 }) => {
  const [beverages, setBeverages] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [error, setError] = useState<string>('');
  const contractAddress = CONTRACT_ADDRESSES.Ordering;

  useEffect(() => {
    const fetchBeverages = async () => {
      const contract = new web3.eth.Contract(OrderingABI as any, contractAddress);
      try {
        const beverages: unknown[] = await contract.methods.getAllValidBeverages().call();
        setBeverages(beverages as string[]);
      } catch (error) {
        console.error('Error fetching beverages:', error);
      }
    };

    fetchBeverages();
  }, [web3, contractAddress]); // 의존성 배열에 contractAddress 추가

  const getOrderDetails = async () => {
    if (orderId) {
      const contract = new web3.eth.Contract(OrderingABI as any, contractAddress);
      try {
        const orderDetails = await contract.methods.orders(orderId).call();
        setOrderDetails(orderDetails);
        setError('');
      } catch (error) {
        setError('Failed to fetch order details. Make sure the order ID is correct.');
        console.error('Error fetching order details:', error);
      }
    }
  };

  return (
    <div>
      <h2>Ordering Contract Info</h2>
      <div>
        <h3>All Valid Beverages</h3>
        <ul>
          {beverages.map((beverage, index) => (
            <li key={index}>{beverage}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Get Order Details</h3>
        <input
          type="text"
          placeholder="Enter order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button onClick={getOrderDetails}>Get Order</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {orderDetails && (
          <pre>{JSON.stringify(orderDetails, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default OrderingInfo;
