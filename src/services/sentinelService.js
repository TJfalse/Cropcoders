import axios from "axios";

const SENTINEL_API_URL = "https://services.sentinel-hub.com/oauth/token";
const SENTINEL_PROCESS_API = "https://services.sentinel-hub.com/api/v1/process";

export const getSentinelToken = async () => {
  try {
    const response = await axios.post(SENTINEL_API_URL, {
      client_id: process.env.SENTINEL_CLIENT_ID,
      client_secret: process.env.SENTINEL_CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get Sentinel token:", error);
    throw error;
  }
};

export const fetchSatelliteImage = async (token, lat, lng) => {
  const requestBody = {
    input: {
      bounds: {
        properties: {
          crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        bbox: [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1],
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              to: new Date().toISOString(),
            },
            maxCloudCoverage: 20,
          },
          processing: {
            upsampling: "BILINEAR",
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
          format: {
            type: "image/tiff",
          },
        },
      ],
    },
  };

  try {
    const response = await axios.post(SENTINEL_PROCESS_API, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch Sentinel image:", error);
    throw error;
  }
};
