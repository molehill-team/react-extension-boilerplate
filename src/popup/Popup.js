import React, { useEffect, useState } from 'react';
import './Popup.css';

const Popup = () => {  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.chrome.runtime.onMessage.addListener((message) => {
      console.log('lisenter useEffect');
      if (message.type === 'CHECKOUT_INITIATED') {
        setProducts(message.data);

      }
    });

    console.log('in useEffect');
  }, []);

  return (
    <div>
      {products.length > 0 ? <span>{products.data[0].product}</span>  : 'no checkout detected'}
      what
    </div>
  );
};


export default Popup;
