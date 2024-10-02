import React, { useEffect, useState } from 'react';
import { getShops } from '../../utils/printifyServices';

const ShopsList = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      const data = await getShops();
      setShops(data);
    };

    fetchShops();
  }, []);

  return (
    <div>
      <h1>My Shops</h1>
      <ul>
        {shops.map((shop) => (
          <li key={shop.id}>{shop.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ShopsList;
