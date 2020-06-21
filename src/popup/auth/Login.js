import React, { useState } from 'react';
import { login } from '../../shared/api';
import { checkStatus } from '../../shared/utils';

import './style.css';

const Login = ({
  onReceiveToken=() => {},
  onToggleFlow=() => {},
}) => {

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    login({ email: emailInput, password: passwordInput })
      .then(checkStatus)
      .then(({ user: { token }}) => onReceiveToken(token));
  };

  return (
    <form onSubmit={onSubmit} className="molehill-login--form">
      <label htmlFor="login-email--input">email</label>
      <input type="email" id="login-email--input" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
      <label htmlFor="login-password--input">password</label>
      <input type="password" id="login-password--input" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
      <button type="submit" onClick={onSubmit}>Login</button>
      <div>don't have an account? <a className="molehill-auth-change-flow" onClick={onToggleFlow}>Create one</a> to get started</div>
    </form>
  );
};


export default Login;