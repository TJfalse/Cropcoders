import "dotenv/config";
import { fetchSatelliteImage } from "./src/services/sentinelService.js";
import fs from "fs/promises";

async function testImageFetch() {
    try {
        const lat = 23.244161540281503 ;
        const lng = 87.8386416974914;
        const bbox = [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1];
        
        const toDate = new Date().toISOString();
        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Test different indices
        const indices = ['RGB', 'NDVI', 'NDWI'];
        
        for (const index of indices) {
            console.log(`Fetching ${index} image for bbox: ${bbox}`);
            const imageData = await fetchSatelliteImage(bbox, fromDate, toDate, index);
            
            // Save the image
            const filename = `satellite_${index.toLowerCase()}_${Date.now()}.png`;
            await fs.writeFile(filename, imageData);
            console.log(`${index} image saved as ${filename}`);
        }
    } catch (error) {
        console.error('Error:', error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          }
        : error.message
    );
  }
}

testImageFetch();
