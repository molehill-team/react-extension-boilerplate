#!/usr/bin/env node

const path = require('path');
const chromeLaunch = require('chrome-launch'); // eslint-disable-line import/no-extraneous-dependencies

require('colors');

const url = 'https://www.wayfair.com/lighting/sb0/desk-lamps-c416505.html';
const dev = path.resolve(__dirname, '..', 'dev');
const args = [`--load-extension=${dev}`, '--auto-open-devtools-for-tabs'];

chromeLaunch(url, { args });