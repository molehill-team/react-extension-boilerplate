import React from 'react';
import {render} from 'react-dom';
import './index.css';
import Popup from './Popup';

import {Provider} from 'react-redux';
import {Store} from 'webext-redux';

const store = new Store();

// wait for the store to connect to the background page
store.ready().then(() => {
  // The store implements the same interface as Redux's store
  // so you can use tools like `react-redux` no problem!
  render(
    <Provider store={store}>
      <Popup text="Ext boilerplate" />
    </Provider>
    , document.getElementById('app'));
});