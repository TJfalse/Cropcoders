# 🌾 CropCoders - Smart Agriculture Satellite Monitoring System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21+-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16+-purple.svg)](https://prisma.io/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A comprehensive **Smart Agriculture Platform** that leverages **Sentinel-2 satellite imagery** and **machine learning** to provide farmers with real-time crop monitoring, vegetation health analysis, and water stress detection. The system processes satellite data to generate actionable insights for precision agriculture.

## 🚀 Key Features

### 🛰️ **Satellite Image Processing**

- **Real-time Sentinel-2 data** fetching via Sentinel Hub API
- **Multi-spectral analysis** supporting RGB, NDVI, NDWI, and COLOR indices
- **High-resolution imagery** (512x512 to 4096x4096 pixels)
- **Automated cloud filtering** (max 20% cloud coverage)
- **TIFF and PNG format support** for different use cases

### 📊 **Agricultural Analytics**

- **NDVI (Normalized Difference Vegetation Index)** - Vegetation health monitoring
- **NDWI (Normalized Difference Water Index)** - Water stress detection
- **True Color RGB** - Visual crop assessment
- **Enhanced COLOR** - Optimized agricultural visualization
- **Time-series analysis** for crop growth tracking

### 🏗️ **Robust Architecture**

- **RESTful API** with Express.js and Node.js
- **Queue-based processing** using Bull.js and Redis
- **PostgreSQL database** with Prisma ORM
- **AWS S3 integration** for scalable image storage
- **JWT authentication** with bcrypt password hashing
- **Background worker processes** for heavy computations

### 🔒 **Enterprise Security**

- **Helmet.js** security headers
- **Rate limiting** (100 requests per 15 minutes)
- **CORS configuration** with customizable origins
- **Input validation** and sanitization
- **Secure password hashing** with bcrypt

### 📱 **Developer Experience**

- **Comprehensive API documentation**
- **Docker containerization** ready
- **TypeScript-like type safety** with Prisma
- **Hot reloading** with nodemon
- **Extensive logging** with Winston
- **Error handling** middleware

## 🏛️ System Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server │    │  Background     │
│   (Mobile/Web)  │────│  (Express.js)│────│   Workers       │
└─────────────────┘    └──────┬───────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     Redis       │
                    │   (Database)    │    │    (Queue)      │
                    └─────────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Prisma ORM    │    │   Bull Queue    │
                    └─────────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   AWS S3        │    │ Sentinel Hub    │
                    │  (Storage)      │    │   (Imagery)     │
                    └─────────────────┘    └─────────────────┘
```

## � Project Structure

```
CropCoders/
├── � Configuration & Setup
│   ├── package.json              # Dependencies and scripts
│   ├── Dockerfile               # Docker containerization
│   ├── docker-compose.yml       # Multi-service orchestration
│   └── .env                     # Environment variables
│
├── 🗄️ Database & ORM
│   └── prisma/
│       ├── schema.prisma        # Database schema definition
│       └── client.js           # Prisma client configuration
│
├── � API Layer
│   ├── index.js                 # Main application entry point
│   └── src/
│       ├── controllers/         # Business logic handlers
│       │   ├── authController.js      # User authentication
│       │   ├── farmController.js      # Farm management
│       │   └── coordinateController.js # Location tracking
│       │
│       ├── routes/              # API endpoint definitions
│       │   ├── authRoutes.js          # Authentication routes
│       │   ├── farmRoutes.js          # Farm management routes
│       │   └── coordinateRoutes.js    # Coordinate routes
│       │
│       ├── middleware/          # Request processing middleware
│       │   └── errorHandler.js        # Global error handling
│       │
│       └── services/            # External service integrations
│           ├── sentinelService.js     # Satellite imagery API
│           ├── storageService.js      # AWS S3 operations
│           └── queueService.js        # Background job management
│
├── ⚙️ Background Processing
│   └── worker.js                # Queue worker for image processing
│
├── 🔐 Authentication
│   └── middleware/
│       └── auth.js              # JWT token handling
│
├── 🧪 Testing & Development
│   ├── test-image-fetch.js      # Satellite imagery testing
│   └── test-multiple.js        # Multi-format testing
│
└── 📚 Documentation
    └── mf _files/
        ├── API_ENDPOINTS.md     # Complete API documentation
        └── DEPLOYMENT.md        # Production deployment guide
```

## 🛠️ Technology Stack

### **Backend Core**

- **Node.js 18+** - JavaScript runtime
- **Express.js 4.21+** - Web application framework
- **Prisma 6.16+** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and queue management

### **Authentication & Security**

- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt 6.0+** - Password hashing
- **Helmet.js** - Security headers
- **express-rate-limit** - API rate limiting
- **CORS** - Cross-origin resource sharing

### **External Integrations**

- **Sentinel Hub API** - Satellite imagery provider
- **AWS SDK** - S3 storage integration
- **Bull Queue** - Background job processing

### **Development & Monitoring**

- **Winston** - Logging framework
- **Morgan** - HTTP request logging
- **nodemon** - Development hot reloading
- **Docker** - Containerization

## � Installation & Setup

### **Prerequisites**

- Node.js 18+ and npm
- PostgreSQL database
- Redis server
- AWS S3 bucket
- Sentinel Hub account

### **1. Clone Repository**

```bash
git clone https://github.com/TJfalse/Cropcoders.git
cd Cropcoders
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Configuration**

Create a `.env` file in the root directory:

```env
# 🗄️ Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/cropcoders"

# 🔴 Redis Configuration
REDIS_URL="redis://localhost:6379"

# 🔐 Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"

# 🛰️ Sentinel Hub API (Register at https://www.sentinel-hub.com/)
SENTINEL_CLIENT_ID="your-sentinel-client-id"
SENTINEL_CLIENT_SECRET="your-sentinel-client-secret"

# ☁️ AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="your-s3-bucket-name"

# ⚙️ Application Settings
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
LOG_LEVEL="info"
```

### **4. Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### **5. Start Development Server**

```bash
# Start main API server
npm run dev

# Start background worker (in separate terminal)
node worker.js
```

The API server will be available at `http://localhost:3000`

---