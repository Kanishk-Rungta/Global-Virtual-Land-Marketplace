import axios from 'axios';

const REGIONS = {
  asia: 'http://localhost:5001',
  us: 'http://localhost:5002',
  eu: 'http://localhost:5003'
};

let currentRegion = 'asia';

const api = axios.create({
  baseURL: REGIONS[currentRegion],
});

export const setRegion = (region) => {
  if (REGIONS[region]) {
    currentRegion = region;
    api.defaults.baseURL = REGIONS[region];
    console.log(`Region switched to ${region.toUpperCase()}: ${REGIONS[region]}`);
  }
};

export const getLands = () => api.get('/api/lands');
export const buyLand = (data) => api.post('/api/lands/buy', data);

export const getCurrentRegionUrl = () => REGIONS[currentRegion];

export default api;
