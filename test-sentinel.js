import 'dotenv/config';
import 'dotenv/config';
import { getSentinelToken } from './src/services/sentinelService.js';

console.log('Testing Sentinel Hub authentication...');
console.log('Environment variables:');
console.log('- SENTINEL_CLIENT_ID:', process.env.SENTINEL_CLIENT_ID);
console.log('- SENTINEL_CLIENT_SECRET:', process.env.SENTINEL_CLIENT_SECRET);
console.log('Client ID:', process.env.SENTINEL_CLIENT_ID ? 'Present' : 'Missing');
console.log('Client Secret:', process.env.SENTINEL_CLIENT_SECRET ? 'Present' : 'Missing');
try {
    const token = await getSentinelToken();
    console.log('Successfully obtained Sentinel token!');
    console.log('Token:', token.substring(0, 10) + '...');  
} catch (error) {
    console.error('Error getting Sentinel token:', error.response ? error.response.data : error.message);
}