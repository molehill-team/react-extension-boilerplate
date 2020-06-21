import React, { useEffect, useState } from 'react';
import './Popup.css';
import Login from './auth/Login';
import Signup from './auth/Signup';


const AuthFlows = {
  LOGIN: 'LOGIN',
  SIGNUP: 'SIGNUP'
};

const Popup = () => {
  const [products, setProducts] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [authFlow, setAuthFlow] = useState(AuthFlows.LOGIN);

  useEffect(() => {
    window.chrome.runtime.onMessage.addListener((message) => {
      console.log('lisenter useEffect');
      if (message.type === 'CHECKOUT_INITIATED') {
        setProducts(message.data);
      }
    });
  }, []);

  if (!userToken) {
    const Comp = authFlow === AuthFlows.LOGIN ? Login : Signup;
    return <Comp onReceiveToken={(t) => setUserToken(t)} onToggleFlow={() => authFlow === AuthFlows.LOGIN ? setAuthFlow(AuthFlows.SIGNUP) : setAuthFlow(AuthFlows.LOGIN)}/>;
  }

  return (
    <div>
      {products.length > 0 ? <span>{products.data[0].product}</span>  : 'no checkout detected'}
    </div>
  );
};


export default Popup;
