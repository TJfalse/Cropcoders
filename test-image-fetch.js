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
        const lat = 23.344161540;
        const lng = 87.938641697;
        const zoom = 20; // higher zoom = smaller bbox = more detail
        const bbox = zoomToBBox(lat, lng, zoom);

        const toDate = new Date().toISOString();
        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const indices = ['RGB', 'NDVI', 'NDWI'];

        for (const index of indices) {
            console.log(`Fetching ${index} image for bbox: ${bbox}`);
            
            // Request higher resolution by specifying width & height
            const imageData = await fetchSatelliteImage(bbox, fromDate, toDate, index, {
                width: 1024,   // increase for higher resolution
                height: 1024
            });

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



