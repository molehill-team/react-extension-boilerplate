import React, { useState } from 'react';
import { signup } from '../../shared/api';
import { checkStatus } from '../../shared/utils';

import './style.css';

const Signup = ({
  onReceiveToken=() => {},
  onToggleFlow=() => {},
}) => {

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    signup({ email: emailInput, password: passwordInput })
      .then(checkStatus)
      .then(({ user: { token }}) => onReceiveToken(token));
  };

  return (
    <form onSubmit={onSubmit} className="molehill-login--form">
      <label htmlFor="login-email--input">email</label>
      <input type="email" id="login-email--input" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
      <label htmlFor="login-password--input">password</label>
      <input type="password" id="login-password--input" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
      <button type="submit" onClick={onSubmit}>Signup</button>
      <div>already have an account? <a className="molehill-auth-change-flow" onClick={onToggleFlow}>Click here</a> to login</div>
    </form>
  );
};


export default Signup;