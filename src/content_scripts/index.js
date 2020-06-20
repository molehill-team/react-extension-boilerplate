if (window.location.href.includes('checkout')) {
  console.log('checkedouted');
  window.chrome.runtime.sendMessage({
    type: 'CHECKOUT_INITIATED', 
    data: [{
      product: 'switch'
    }]
  });
}
console.log(window.location.href);