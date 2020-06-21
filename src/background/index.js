/* eslint-disable no-undef */
import { wrapStore } from 'webext-redux';
import store from '../store';
import { DEBUG } from '../shared/resources';

console.log('Background.js file loaded');

/* const defaultUninstallURL = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://wwww.github.com/kryptokinght'
    : '';
}; */

browser.runtime.onMessage.addListener(function (message) {
  console.log(message);
  window.chrome.runtime.sendMessage({
    type: 'lololol', 
    data: [{
      product: 'switch'
    }]
  });
});

if (DEBUG) {
  window.store = store;
}


wrapStore(store);