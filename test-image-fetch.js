import 'dotenv/config';
import { fetchSatelliteImage } from './src/services/sentinelService.js';
import fs from 'fs/promises';

async function testImageFetch() {
    try {
        const lat = 12.9716;
        const lng = 77.5946;
        const bbox = [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1];
        
        const toDate = new Date().toISOString();
        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        console.log(`Fetching satellite image for bbox: ${bbox}`);
        const imageData = await fetchSatelliteImage(bbox, fromDate, toDate);
    
        
        const filename = `satellite_image_${Date.now()}.png`;
        await fs.writeFile(filename, imageData);
        console.log(`Image saved as ${filename}`);
    } catch (error) {
        console.error('Error:', error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
        } : error.message);
    }
}

testImageFetch();