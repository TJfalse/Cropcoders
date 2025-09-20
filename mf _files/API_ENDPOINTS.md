# API Endpoints Documentation

This document provides detailed information about all available API endpoints in the Smart Agriculture Satellite Monitoring System.

## 🔑 Authentication Endpoints

### Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "secure_password",
  "name": "John Farmer"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🌾 Farm Management Endpoints

### Create New Farm
```http
POST /farms
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Wheat Farm",
  "centerLat": 23.4567,
  "centerLng": 76.5432,
  "polygonGeo": {
    "type": "Polygon",
    "coordinates": [
      [
        [76.5432, 23.4567],
        [76.5432, 23.4568],
        [76.5433, 23.4568],
        [76.5433, 23.4567],
        [76.5432, 23.4567]
      ]
    ]
  }
}
```

**Response (201):**
```json
{
  "id": "farm_uuid",
  "name": "My Wheat Farm",
  "centerLat": 23.4567,
  "centerLng": 76.5432,
  "polygonGeo": { ... },
  "createdAt": "2025-09-20T10:00:00Z"
}
```

### Get All Farms
```http
GET /farms
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "farms": [
    {
      "id": "farm_uuid",
      "name": "My Wheat Farm",
      "centerLat": 23.4567,
      "centerLng": 76.5432,
      "polygonGeo": { ... },
      "createdAt": "2025-09-20T10:00:00Z"
    }
  ]
}
```

### Get Single Farm
```http
GET /farms/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "farm_uuid",
  "name": "My Wheat Farm",
  "centerLat": 23.4567,
  "centerLng": 76.5432,
  "polygonGeo": { ... },
  "createdAt": "2025-09-20T10:00:00Z"
}
```

## 📍 Coordinate Endpoints

### Submit Coordinate
```http
POST /farms/:farmId/coordinates
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clientEventId": "unique_event_id",
  "lat": 23.4567,
  "lng": 76.5432,
  "accuracy": 5.0
}
```

**Response (201):**
```json
{
  "id": "coordinate_uuid",
  "clientEventId": "unique_event_id",
  "lat": 23.4567,
  "lng": 76.5432,
  "accuracy": 5.0,
  "status": "queued",
  "queuedAt": "2025-09-20T10:00:00Z"
}
```

### Sync Offline Coordinates
```http
POST /farms/:farmId/coordinates/sync
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "coordinates": [
    {
      "clientEventId": "unique_event_id_1",
      "lat": 23.4567,
      "lng": 76.5432,
      "accuracy": 5.0
    },
    {
      "clientEventId": "unique_event_id_2",
      "lat": 23.4568,
      "lng": 76.5433,
      "accuracy": 4.8
    }
  ]
}
```

**Response (200):**
```json
{
  "processed": [
    {
      "clientEventId": "unique_event_id_1",
      "status": "queued"
    },
    {
      "clientEventId": "unique_event_id_2",
      "status": "queued"
    }
  ]
}
```

### Get Coordinate Status
```http
GET /coordinates/:id/status
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "coordinate_uuid",
  "status": "processed",
  "queuedAt": "2025-09-20T10:00:00Z",
  "processedAt": "2025-09-20T10:05:00Z",
  "imageUrl": "https://your-bucket.s3.amazonaws.com/path/to/image.tiff"
}
```

## 📸 Image Endpoints

### Get Processed Image
```http
GET /images/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "image_uuid",
  "url": "https://your-bucket.s3.amazonaws.com/path/to/image.tiff",
  "metadata": {
    "captureDate": "2025-09-20T10:00:00Z",
    "satellite": "sentinel-2",
    "cloudCover": 10.5,
    "bbox": {
      "minLat": 23.4467,
      "maxLat": 23.4667,
      "minLng": 76.5332,
      "maxLng": 76.5532
    }
  }
}
```

## ⚠️ Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": ["Field 'lat' must be a number"]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "requestId": "req_uuid"
}
```

## 🔄 Rate Limits

- Authentication endpoints: 10 requests per minute per IP
- Farm management endpoints: 60 requests per minute per user
- Coordinate submission: 120 requests per minute per user
- Image retrieval: 300 requests per minute per user

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. Coordinates use WGS84 (EPSG:4326) coordinate system
3. Authentication token must be included in the Authorization header
4. Client should implement exponential backoff for rate limits
5. Use clientEventId for idempotency in coordinate submission