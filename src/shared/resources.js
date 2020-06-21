let ResourcesConstants;

if (process.env.ENVIRONMENT === 'prod') {
  ResourcesConstants = {
    API_URL: 'https://molehill.herokuapp.com',
    APP_URL: 'https://molehill.herokuapp.com',
  };
} else {
  ResourcesConstants = {
    API_URL: 'http://localhost:5000',
    APP_URL: 'http://localhost:5000',
  };
}

export const DEBUG = process.env.ENV !== 'production';
export const API_URL = ResourcesConstants.API_URL;
export const APP_URL = ResourcesConstants.APP_URL;