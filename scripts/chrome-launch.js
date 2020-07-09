#!/usr/bin/env node

const path = require('path');
const chromeLaunch = require('chrome-launch'); // eslint-disable-line import/no-extraneous-dependencies

require('colors');

const url = 'https://www.wayfair.com/furniture/pdx/brayden-studio-manolla-tv-stand-for-tvs-up-to-78-w001300295.html';
const dev = path.resolve(__dirname, '..', 'dev');
const args = [`--load-extension=${dev}`, '--auto-open-devtools-for-tabs'];

chromeLaunch(url, { args });