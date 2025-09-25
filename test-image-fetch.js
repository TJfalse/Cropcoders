import "dotenv/config";
import { fetchSatelliteImage } from "./src/services/sentinelService.js";
import fs from "fs/promises";

/**
 * Converts a zoom level into a bbox size in degrees.
 * Higher zoom → smaller bbox.
 */
function zoomToBBox(lat, lng, zoom = 10) {
    const baseSize = 0.2; // roughly 0.2° for zoom=1
    const factor = baseSize / zoom; 
    return [
        lng - factor,
        lat - factor,
        lng + factor,
        lat + factor
    ];
}

async function testImageFetch() {
    try {
        const lat = 27.1745704;
        const lng = 78.0399508;
        const zoom = 30; // higher zoom = smaller bbox = more detail
        const bbox = zoomToBBox(lat, lng, zoom);

        const toDate = new Date().toISOString();
        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // ✅ Add COLOR here
        const indices = ['RGB', 'NDVI', 'NDWI', 'COLOR'];

        for (const index of indices) {
            console.log(`Fetching ${index} image for bbox: ${bbox}`);
            
            // Fetch image (adjusted for your fetchSatelliteImage signature)
            const imageData = await fetchSatelliteImage(bbox, fromDate, toDate, index);

            const filename = `satellite_${index.toLowerCase()}_${Date.now()}.png`;
            await fs.writeFile(filename, imageData);
            console.log(`${index} image saved as ${filename}`);
        }
    } catch (error) {
        console.error('Error:', error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
        } : error.message);
    }
}

testImageFetch();
