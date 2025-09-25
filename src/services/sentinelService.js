import axios from "axios";

const SENTINEL_OAUTH_URL = "https://services.sentinel-hub.com/oauth/token";
const SENTINEL_PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process";

async function getAccessToken() {
  try {
    const res = await axios.post(
      SENTINEL_OAUTH_URL,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SENTINEL_CLIENT_ID,
        client_secret: process.env.SENTINEL_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return res.data.access_token;
  } catch (err) {
    console.error(
      "Failed to get Sentinel token:",
      err.response?.data || err.message
    );
    throw new Error("Authentication with Sentinel Hub failed");
  }
}

const EVALSCRIPTS = {
  RGB: `//VERSION=3
  function setup() {
    return {
      input: ["B04", "B03", "B02"], // Red, Green, Blue
      output: { bands: 3 }
    };
  }
function evaluatePixel(sample) {
  return [
    sample.B04 / 10000,  // Red
    sample.B03 / 10000,  // Green
    sample.B02 / 10000   // Blue
  ];
}`,

  NDVI: `//VERSION=3
  function setup() {
    return {
      input: ["B08", "B04"], // NIR, Red
      output: { bands: 3 }
    };
  }
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let scaledNDVI = (ndvi + 1) / 2;
  return [scaledNDVI, scaledNDVI, scaledNDVI];
}`,

  NDWI: `//VERSION=3
  function setup() {
    return {
      input: ["B03", "B08"], // Green, NIR
      output: { bands: 3 }
    };
  }
  function evaluatePixel(sample) {
    let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
    return [
      0,          // R
      (1 + ndwi), // G (water in green)
      (-ndwi)     // B (vegetation in blue)
    ];
  }`,
};

async function fetchSatelliteImage(bbox, fromDate, toDate, index = "RGB") {
  const token = await getAccessToken();

  if (!EVALSCRIPTS[index]) {
    throw new Error(
      `Unsupported index: ${index}. Available indices: ${Object.keys(
        EVALSCRIPTS
      ).join(", ")}`
    );
  }

  const evalscript = EVALSCRIPTS[index];

  const requestBody = {
    input: {
      bounds: {
        bbox: bbox, // [minLon, minLat, maxLon, maxLat]
        properties: {
          crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
      },
      data: [
        {
          type: "S2L2A",
          dataFilter: {
            timeRange: {
              from: fromDate,
              to: toDate,
            },
            maxCloudCoverage: 20,
          },
        },
      ],
    },
    output: {
      width: 512,
      height: 512,
      responses: [
        {
          identifier: "default",
          format: { type: "image/png" },
        },
      ],
    },
    evalscript: evalscript,
  };

  try {
    const res = await axios.post(SENTINEL_PROCESS_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "image/png",
      },
      responseType: "arraybuffer", // return binary image
    });

    return res.data; // PNG buffer
  } catch (err) {
    if (err.response) {
      const text = err.response.data.toString("utf8");
      console.error("❌ Failed to fetch satellite image:", text);
    } else {
      console.error("❌ Failed to fetch satellite image:", err.message);
    }
    throw new Error("Satellite image fetch failed");
  }
}

export { fetchSatelliteImage };
