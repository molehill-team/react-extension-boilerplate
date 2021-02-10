const { createProduct } = require('../shared/api');
const { APP_URL } = require('../shared/resources');
// const { ftruncate } = require('fs-extra');

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

if (window.location.href.includes('https://secure.wayfair.com/v/checkout/onepage/view')) {
  let button_elements, place_order_button;

  button_elements = Array.from(document.getElementsByClassName('Button-content'));
  for (let i = 0; i < button_elements.length; i++) {
    if (getDirectLastText(button_elements[i]) === 'Place Your Order') {
      place_order_button = button_elements[i];
    }
  }

  if (place_order_button) {
    scrape_cart('wayfair');
  }
}

function getDirectLastText(ele) {
  let txt = null;
  [].forEach.call(ele.childNodes, function (v) {
    if (v.nodeType === 3) txt = v.textContent.replace(/^\W*\n/, '');
  });
  return txt;
}

let asin;

function hasParentWithClassName(ele, className) {
  if (ele.parentElement === null) {
    return false;
  } else if (ele.parentElement.className.includes(className)) {
    return true;
  } else {
    return hasParentWithClassName(ele.parentElement, className);
  }
}

function scrape_cart(site_name) {
  let image_elements, cart_elements;

  cart_elements = [];
  image_elements = Array.from(document.getElementsByClassName('ImageComponent-image')).forEach(ele => {
    if (hasParentWithClassName(ele, 'ConfirmationProductCard')) {
      let prod_id = ele.src.match(/\/[A-W]+[0-9]+\./g)[0].slice(1,-1);
      if (!cart_elements.includes(prod_id)) {
        cart_elements.push(prod_id);
      }
    }
  });

  add_molehill_popup()
}

function add_molehill_popup() {
  popup_div = document.createElement('div');

  popup_div.style.position = 'fixed';
  popup_div.style.top = '2%';
  popup_div.style.height = '70%';
  popup_div.style.width = '300px';
  popup_div.style.right = '2%';
  popup_div.style.backgroundColor = '#fcfcfc';
  popup_div.style.borderRadius = '30px';
  popup_div.style.border = '2px solid #0d0';

  // header_div = document.createElement

  document.body.appendChild(popup_div);
}

function convert_units_to_mm_or_g(unit, value) {
  let unit_dictionary = {'inches': 25.4, 'in': 25.4, 'inch': 25.4, 'ins': 25.4,
    'feet': 25.4*12, 'ft': 25.4*12, 'foot': 25.4*12,
    'millimeters': 1, 'mm': 1, 'millimeter': 1, 'mms': 1,
    'centimeters': 10, 'cm': 10, 'centimeter': 10, 'cms': 10,
    'meters': 1000, 'm': 1000, 'meter': 1000, 'ms': 1000,
    'pounds': 453.592, 'lbs': 453.592, 'lb': 453.592, 'pound': 453.592, 'lb.': 453.592,
    'ounces': 453.592/16, 'oz': 453.592/16, 'ozs': 453.592/16, 'ounce': 453.592/16,
    'grams': 1, 'g': 1, 'gram': 1, 'gs': 1,
    'kilograms': 1000, 'kg': 1000, 'kilogram': 1000, 'kgs': 1000};

  if (!Object.keys(unit_dictionary).includes(unit)) {
    return -1;
  } else {
    return value*unit_dictionary[unit];
  }
}

function find_spec_element(match_type, site_name) {
  let match_strings = [];

  // set an array of strings to match to depending on if we're looking for dimensions or weight
  if (match_type === 'dimension') {
    if (site_name === 'wayfair' || site_name === 'wayfair-quick') {
      match_strings = ['Overall'];
    } else {
      match_strings = ['Product Dimensions', 'Package Dimensions', 'Size', 'Assembled Product Dimensions (L x W x H)'];  
    }
  } else if (match_type === 'weight') {
    if (site_name === 'wayfair' || site_name === 'wayfair-quick') {
      match_strings = ['Overall Product Weight', 'Overall Weight'];
    } else {
      match_strings = ['Item Weight', 'Weight', 'Assembled Product Weight'];
    }
  } else if (match_type === 'origin') {
    match_strings = ['Country of Origin', 'Country of Origin - Additional Details'];
  } else {
    return false;
  }

  let all_elements = document.getElementsByTagName('*');
  let match_elements = [];
  let text_element;

  // find all elements in page that match the strings we're searching for
  for (let i = 0; i < all_elements.length; i++) {
    let element_text = getDirectLastText(all_elements[i]);
    if (element_text) {
      if (match_strings.includes(element_text.trim())) {
        match_elements.push(all_elements[i]);
      }
    }
  }

  if (match_elements.length > 0) {
    // sort through matching elements and select the one most likely to be correct
    for (let i = 0; i < match_elements.length; i++) {
      if (match_elements[i].className.includes('ProdDetSectionEntry')) {
        text_element = match_elements[i];
      }
    }
    if (!text_element) {
      text_element =  match_elements[0];
    }

    // assuming element is part of a table, find the nearest parent element that is <td>, <th>, or <tr>
    return get_nearest_table_parent(text_element).nextElementSibling;

  } else {
    // if no matching elements found, return false
    return false;
  }
}

function get_nearest_table_parent(element) {
  if (element.tagName.match(/[DdTt][A-Za-z]/) && element.tagName.length === 2) {
    return element;
  } else {
    return get_nearest_table_parent(element.parentElement);
  }
}

function scrape_data(prod_id, site_name) {

  // initialize some variables
  let prod_dimens, dimens_text, dimens_unit, dimens_array, prod_weight, weight_text, weight_unit, weight_float;

  let product_title, div_bread_crumb, list_bread_crumb;
  switch (site_name) {
    case 'amazon':
      product_title = document.getElementById('productTitle').innerText;
      div_bread_crumb = document.getElementById('wayfinding-breadcrumbs_feature_div');
      list_bread_crumb = div_bread_crumb.getElementsByTagName('ul')[0];
      break;
    case 'walmart':
      product_title = document.getElementsByClassName('prod-ProductTitle')[0].innerText;
      div_bread_crumb = document.getElementsByClassName('breadcrumb-list')[0];
      list_bread_crumb = div_bread_crumb;
      break;
    case 'wayfair':
      product_title = document.getElementsByClassName('pl-Heading--pageTitle')[0].innerText;
      div_bread_crumb = document.getElementsByClassName('Breadcrumbs-list')[0];
      list_bread_crumb = div_bread_crumb;
      break;
    case 'wayfair-quick':
      product_title = document.getElementsByClassName('QuickViewComponent')[0].getElementsByClassName('pl-Heading--pageTitle')[0].innerText;
      div_bread_crumb = document.getElementsByClassName('Breadcrumbs-list')[0];
      list_bread_crumb = div_bread_crumb;
      break;
  }

  // find product dimension ---------------------------------------------------------------------------------------------
  prod_dimens = find_spec_element('dimension', site_name);
  if (prod_dimens) {
    dimens_text = prod_dimens.innerText;

    // check for multiple units of dimensions by looking for '(' and remove them and anything that follows
    if (dimens_text.includes('(')) {
      dimens_text = dimens_text.slice(0, dimens_text.indexOf('(')).trim();
    }

    // if " is used for inches, set units manually and remove all " from string (unicode \u201D used for ")
    if (dimens_text.includes('\u201D') || dimens_text.includes('\'\'')) {
      dimens_unit = 'inches';
      dimens_text = dimens_text.replace(/\u201D/g, '');
      dimens_text = dimens_text.replace(/'/g, '');
    } else {
      dimens_unit = dimens_text.slice(dimens_text.lastIndexOf(' '), ).trim();
      dimens_text = dimens_text.slice(0, dimens_text.lastIndexOf(' ')).trim();
    }

    // create array from dimension values and use units to convert to millimeters
    dimens_text = dimens_text.replace(/[A-WY-Za-wy-z]/g, '');
    dimens_array = dimens_text.split('x');

    for (let i = 0; i < dimens_array.length; i++) {
      dimens_array[i] = convert_units_to_mm_or_g(dimens_unit.toLowerCase(), parseFloat(dimens_array[i]));
    }
  } else {
    dimens_unit = undefined;
    dimens_array = [0, 0, 0];
  }

  // find product weight ---------------------------------------------------------------------------------------------
  prod_weight = find_spec_element('weight', site_name);
  if (prod_weight) {
    weight_text = prod_weight.innerText;

    // check for multiple units of dimensions by looking for '(' and remove them and anything that follows
    if (weight_text.includes('(')) {
      weight_text = weight_text.slice(0, weight_text.indexOf('(')).trim();
    }

    // find units
    weight_unit = weight_text.slice(weight_text.lastIndexOf(' '), ).trim();

    // use units to convert to grams
    weight_float = convert_units_to_mm_or_g(weight_unit.toLowerCase(),
      parseFloat(weight_text.slice(0, weight_text.lastIndexOf(' '))));
  } else {
    weight_unit = undefined;
    weight_float = 0;
  }

  // get product category --------------------------------------------------------------------------------------------
  let bread_crumbs = [];
  if (div_bread_crumb) {
    for (let i = 0; i < list_bread_crumb.children.length; i++) {
      // if statement to ignore '>' dividers in category list
      if (list_bread_crumb.children[i].className !== 'a-breadcrumb-divider') {
        let bread_crumb_text = list_bread_crumb.children[i].innerText;
        if (bread_crumb_text.trim().startsWith('/')) {
          bread_crumb_text = bread_crumb_text.slice(1, );
        } else if (bread_crumb_text.trim().endsWith('/')) {
          bread_crumb_text = bread_crumb_text.slice(0, -1);
        }
        bread_crumbs.push(bread_crumb_text);
      }}}
  if (bread_crumbs[bread_crumbs.length-1].includes('SKU:')) {
    bread_crumbs = bread_crumbs.slice(0, -1);
  }

  // reverse array to put most detailed category first
  bread_crumbs.reverse();

  // get product origin --------------------------------------------------------------------------------
  let prod_origin, origin_text;
  prod_origin = find_spec_element('origin', site_name);
  if (prod_origin) {
    origin_text = prod_origin.innerText.trim();
  } else {
    origin_text = undefined;
  }

  // sourceURL -------------------------------------------------------------------------------------------------
  let source_url;
  if (site_name === 'wayfair-quick') {
    let link_elements = document.getElementsByClassName('Button--primary');
    for (let j=1; j < link_elements.length; j++) {
      if (link_elements[j].innerText === 'See Full Details') {
        source_url = link_elements[j].href;
      }
    } 
  } else {
    source_url = window.location.href;
  }

  //  create and send http request to save data to DB ----------------------------------------------------------------
  const dimensionsIsAllZero = dimens_array.every(z => z === 0);
  createProduct({
    name: product_title.replace(/ /g, '_'),
    category: bread_crumbs.join(',').replace(/ /g, '_'),
    productId: prod_id,
    sourceURL: source_url,
    dimensions_mm: dimensionsIsAllZero ? undefined : dimens_array,
    weight_g: weight_float || undefined,
    source: window.location.hostname,
    originLocation: origin_text,
  }, undefined);
}

const getProductIds = () => {
  return [...document.querySelectorAll('input[type="hidden"]')]
    .filter(d => d.name.includes('Asin'))
    .map(d => d.value);
};

function add_molehill_button() {
  const submit_buttons = [document.getElementById('placeYourOrder')];
  for (let i = 0; i < submit_buttons.length; i++) {
    const submitButton = submit_buttons[i];
    if (!submitButton) {
      continue;
    }
    const newdiv = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.checked = true;
    checkbox.type = 'checkbox';
    checkbox.style = 'margin-right: 6px;';
    const cta = document.createElement('span');
    cta.innerText = 'open a tab to Molehill when I place my order';
    newdiv.appendChild(checkbox);
    newdiv.appendChild(cta);
    newdiv.style = 'display: flex; align-items: center; font-size: 11px; margin-top: 6px;';
    submitButton.parentNode.insertBefore(newdiv, submitButton.nextSibling);
    submitButton.addEventListener('click', () => {
      if (checkbox.checked) {
        const productIds = getProductIds().join(',');
        window.open(`${APP_URL}/offset-order?ids=${productIds}`, '_blank');
      }
    });
  }
}

function add_observer(mutation_function) {
  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (!mutation.addedNodes) return;
      for (let i=0; i < mutation.addedNodes.length; i++) {
        mutation_function(mutation.addedNodes[i]);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  return observer;
}

// look for ASIN in url
const asin_reg_ex = /\/[A-Z0-9]{10}[/?]/;
let asin_matches = window.location.href.match(asin_reg_ex);
if (asin_matches) {
  asin = asin_matches[0].slice(1, -1);
} else {
  asin = null;
}

// if amazon product page, scrape product data and send to server
if (window.location.href.includes('amazon.com') && asin) {
  scrape_data(asin, 'amazon');

} else if (window.location.href.includes('amazon.com/gp/buy/spc/handlers/display.html')) {
  add_molehill_button();
}

// if walmart product page, scrape data
if (window.location.href.includes('walmart.com/ip')) {
  let walmart_id = getDirectLastText(document.getElementsByClassName('wm-item-number')[0]);
  scrape_data(walmart_id, 'walmart');
}

// if wayfair product page, scrape data
if (window.location.href.includes('wayfair.com')) {
  let product_page;
  try {
    product_page = document.getElementsByClassName('Breadcrumbs')[0].innerText.includes('SKU');
  } catch {
    product_page = false;
  } 

  add_observer(node => {
    if (node.className.includes('SidePanel')) {
      console.log('Hello side panel');
    }
  });

  if (product_page) {

    // get wayfair SKU
    let wayfair_sku_text = document.getElementsByClassName('Breadcrumbs-item')[0].innerText;
    let wayfair_sku = wayfair_sku_text.slice(wayfair_sku_text.indexOf(' ') + 1, );

    // create observer to find when page is fully loaded
    add_observer(node => {
      if (node.className === 'adsbox') {
        scrape_data(wayfair_sku, 'wayfair');
      }
    });

  } else {

    // create observer to watch for quickview objects
    add_observer(node => {
      if (node.className === 'ProductWeightsDimensions-list') {
        // get wayfair SKU
        let link_elements = document.getElementsByClassName('Button--primary');
        for (let j=1; j < link_elements.length; j++) {
          if (link_elements[j].innerText === 'See Full Details') {
            let wayfair_sku_text = link_elements[j].href;
            let wayfair_sku = wayfair_sku_text.match(/-[a-z]*[0-9]*.html/g)[0].slice(1, -5).toUpperCase();
            scrape_data(wayfair_sku, 'wayfair-quick');
          }
        }
      }
    });

  }
}