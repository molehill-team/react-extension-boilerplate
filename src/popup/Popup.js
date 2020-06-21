import React, { useEffect, useState } from 'react';
import './Popup.css';
import { login } from '../shared/api';
import { checkStatus } from '../shared/utils';


const Login = ({
  onReceiveToken=() => {},
}) => {

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    login({ email: emailInput, password: passwordInput })
      .then(checkStatus)
      .then(({ user: { token }}) => onReceiveToken(token));
  };

  console.log('got here');

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="login-email--input">email</label>
      <input type="email" id="login-email--input" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
      <label htmlFor="login-password--input">password</label>
      <input type="password" id="login-password--input" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
      <button type="submit" onClick={onSubmit}>Login</button>
    </form>
  );
};

const Popup = () => {
  const [products, setProducts] = useState([]);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    window.chrome.runtime.onMessage.addListener((message) => {
      console.log('lisenter useEffect');
      if (message.type === 'CHECKOUT_INITIATED') {
        setProducts(message.data);
      }
    });

    console.log('in useEffect');
  }, []);

  console.log('do we get here?', userToken);

  if (!userToken) {
    return <Login onReceiveToken={(t) => setUserToken(t)} />;
  }

  return (
    <div>
      {products.length > 0 ? <span>{products.data[0].product}</span>  : 'no checkout detected'}
    </div>
  );
};


export default Popup;
