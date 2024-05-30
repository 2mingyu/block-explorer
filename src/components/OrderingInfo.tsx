// src/components/OrderingInfo.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import OrderingABI from '../ABIs/Ordering_ABI.json';
import { CONTRACT_ADDRESSES } from '../contracts';

interface OrderingInfoProps {
  web3: Web3;
}

interface Order {
  customer: string;
  beverage: string;
  fulfilled: boolean;
}

const OrderingInfo: React.FC<OrderingInfoProps> = ({ web3 }) => {
  const [beverages, setBeverages] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const contractAddress = CONTRACT_ADDRESSES.Ordering;

  useEffect(() => {
    const fetchBeveragesAndOrders = async () => {
      setLoading(true);
      const contract = new web3.eth.Contract(OrderingABI as any, contractAddress);
      try {
        const beverages: unknown[] = await contract.methods.getAllValidBeverages().call();
        setBeverages(beverages as string[]);

        // 총 주문 수 계산 및 주문 데이터 가져오기
        let ordersCount = 0;
        let allOrders: Order[] = [];
        while (true) {
          try {
            const order: Order | null = await contract.methods.orders(ordersCount).call();
            if (order) {
              allOrders.push(order);
              ordersCount++;
            } else {
              break;
            }
          } catch (error) {
            break;
          }
        }
        setOrders(allOrders);
        setTotalOrders(ordersCount);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBeveragesAndOrders();
  }, [web3, contractAddress]);

  const shortenAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Address copied to clipboard!');
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
        <h3>Total Orders</h3>
        <p>{totalOrders !== null ? totalOrders : 'Loading...'}</p>
      </div>
      <div className="order-list">
        <h3>All Orders</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div className="order-list">
            <div className="order-list-header">
              <div>Customer</div>
              <div>Beverage</div>
              <div>Fulfilled</div>
            </div>
            {orders.map((order, index) => (
              <div key={index} className="order-list-item">
                <div>
                  <span title={order.customer} onClick={() => copyToClipboard(order.customer)} className="address">
                    {shortenAddress(order.customer)}
                  </span>
                </div>
                <div>{order.beverage}</div>
                <div>{order.fulfilled ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderingInfo;
