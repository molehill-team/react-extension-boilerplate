const { createProduct } = require('../shared/api');
const { APP_URL } = require('../shared/resources');

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

function getDirectLastText(ele) {
  let txt = null;
  [].forEach.call(ele.childNodes, function (v) {
    if (v.nodeType === 3) txt = v.textContent.replace(/^\W*\n/, '');
  });
  return txt;
}

let asin;

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
    if (site_name === 'wayfair') {
      match_strings = ['Overall'];
    } else {
      match_strings = ['Product Dimensions', 'Package Dimensions', 'Size', 'Assembled Product Dimensions (L x W x H)'];  
    }
  } else if (match_type === 'weight') {
    if (site_name === 'wayfair') {
      match_strings = ['Overall Product Weight'];
    } else {
      match_strings = ['Item Weight', 'Weight', 'Assembled Product Weight'];
    }
  } else {
    return false;
  }

  let all_elements = document.getElementsByTagName('*');
  let match_elements = [];
  let text_element;

  let test = document.getElementsByClassName('ProductWeightsDimensions-descriptionListItem');
  console.log(test.length);
  for (let i = 0; i < test.length; i++) {
    console.log(i);
    // console.log(test[i]);
  }
  console.log(test);

  // find all elements in page that match the strings we're searching for
  for (let i = 0; i < all_elements.length; i++) {
    let element_text = getDirectLastText(all_elements[i]);
    if (element_text) {
      // console.log(element_text);
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
    console.log(text_element);

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
  }

  // find product dimension ---------------------------------------------------------------------------------------------
  prod_dimens = find_spec_element('dimension', site_name);
  console.log(prod_dimens);
  if (prod_dimens) {
    dimens_text = prod_dimens.innerText;

    // check for multiple units of dimensions by looking for '(' and remove them and anything that follows
    if (dimens_text.includes('(')) {
      dimens_text = dimens_text.slice(0, dimens_text.indexOf('(')).trim();
    }

    // if " is used for inches, set units manually and remove all " from string (unicode \u201D used for ")
    if (dimens_text.includes('\u201D')) {
      dimens_unit = 'inches';
      dimens_text = dimens_text.replace(/\u201D/g, '');
    } else {
      dimens_unit = dimens_text.slice(dimens_text.lastIndexOf(' '), ).trim();
      dimens_text = dimens_text.slice(0, dimens_text.lastIndexOf(' ')).trim();
    }

    // create array from dimension values and use units to convert to millimeters
    dimens_array = dimens_text.split('x');

    for (let i = 0; i < dimens_array.length; i++) {
      dimens_array[i] = convert_units_to_mm_or_g(dimens_unit.toLowerCase(), parseFloat(dimens_array[i]));
    }
  } else {
    dimens_unit = 'None';
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
    weight_unit = 'None';
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

  //  create and send http request to save data to DB ----------------------------------------------------------------
  const dimensionsIsAllZero = dimens_array.every(z => z === 0);
  console.log({
    name: product_title.replace(/ /g, '_'),
    category: bread_crumbs.join(',').replace(/ /g, '_'),
    productId: prod_id,
    sourceURL: window.location.href,
    dimensions_mm: dimensionsIsAllZero ? undefined : dimens_array,
    weight_g: weight_float || undefined,
    source: window.location.hostname,
    originLocation: undefined,
  });
  createProduct({
    name: product_title.replace(/ /g, '_'),
    category: bread_crumbs.join(',').replace(/ /g, '_'),
    productId: prod_id,
    sourceURL: window.location.href,
    dimensions_mm: dimensionsIsAllZero ? undefined : dimens_array,
    weight_g: weight_float || undefined,
    source: window.location.hostname,
    originLocation: undefined,
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

if (window.location.href.includes('wayfair.com')) {
  let product_page;
  try {
    product_page = document.getElementsByClassName('Breadcrumbs')[0].innerText.includes('SKU');
  } catch {
    product_page = false;
  } 
  if (product_page) {
    // get wayfair SKU
    let wayfair_sku_text = document.getElementsByClassName('Breadcrumbs-item')[0].innerText;
    let wayfair_sku = wayfair_sku_text.slice(wayfair_sku_text.indexOf(' ') + 1, );
    document.addEventListener('load', scrape_data(wayfair_sku, 'wayfair'));
  }
}