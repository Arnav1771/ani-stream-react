export const DEPLOYMENT_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  CLIENT_URL: process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  DEPLOYMENT_MODE: process.env.REACT_APP_DEPLOYMENT_MODE || 'local',
};

export const getApiUrl = () => {
  if (DEPLOYMENT_CONFIG.DEPLOYMENT_MODE === 'local') {
    return DEPLOYMENT_CONFIG.API_URL;
  } else {
    return DEPLOYMENT_CONFIG.CLIENT_URL + '/api';
  }
};

export const getClientUrl = () => {
  return DEPLOYMENT_CONFIG.CLIENT_URL;
};

export const getEnvironment = () => {
  return DEPLOYMENT_CONFIG.ENVIRONMENT;
};

export const getDeploymentMode = () => {
  return DEPLOYMENT_CONFIG.DEPLOYMENT_MODE;
};