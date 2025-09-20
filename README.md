# Smart Agriculture Satellite Monitoring System

## 🌾 Overview

This project is a sophisticated backend system that helps farmers monitor their agricultural land using satellite imagery. The system allows farmers to register their farms and set coordinates, which are then used to fetch and analyze satellite images from the Sentinel satellite system.

```mermaid
graph TD
    A[Farmer's Mobile/Web App] --> B[Express Backend API]
    B --> C[Authentication Service]
    B --> D[Farm Management]
    B --> E[Coordinate Processing]
    E --> F[Redis Queue]
    F --> G[Worker Service]
    G --> H[Sentinel Satellite API]
    H --> I[Image Processing]
    I --> J[S3 Storage]
    K[ML Model] --> I
```

## 🚀 Features

- 👨‍🌾 **Farmer Authentication**
  - Secure signup and login
  - JWT-based authentication
  - Password encryption

- 🌍 **Farm Management**
  - Register multiple farms
  - Set farm boundaries
  - View farm details

- 📍 **Coordinate System**
  - Set coordinates via GPS
  - Offline support for poor network areas
  - Automatic sync when network available

- 🛰️ **Satellite Integration**
  - Real-time Sentinel satellite image fetching
  - Automatic image processing
  - Historical image storage

- 💾 **Data Storage**
  - Secure image storage in S3
  - Efficient metadata management
  - Quick retrieval system

## 🛠️ Technical Architecture

### System Components

1. **API Server (Express.js)**
   - Handles HTTP requests
   - Manages authentication
   - Coordinates data flow

2. **Database (PostgreSQL + Prisma)**
   - Stores user data
   - Manages farm information
   - Tracks coordinates

3. **Queue System (Redis + Bull)**
   - Manages background jobs
   - Handles offline synchronization
   - Processes satellite image requests

4. **Worker Service**
   - Fetches satellite images
   - Processes image data
   - Updates job status

5. **Storage System (AWS S3)**
   - Stores satellite images
   - Manages file organization
   - Handles secure access

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Redis
- AWS Account
- Sentinel Hub Account

### Environment Variables

Create a \`.env\` file with:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
JWT_SECRET="your-secret-key"

# Redis
REDIS_URL="redis://localhost:6379"

# Sentinel Hub
SENTINEL_CLIENT_ID="your-client-id"
SENTINEL_CLIENT_SECRET="your-client-secret"

# AWS
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
AWS_REGION="us-east-1"
\`\`\`

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/Cropcoders.git
   cd SIH
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up the database:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

4. Start the services:
   \`\`\`bash
   # Start the API server
   npm run dev

   # Start the worker in a new terminal
   node worker.js
   \`\`\`

## 🔄 Data Flow

1. Farmer registers and logs in through mobile/web app
2. Creates farm and sets coordinates
3. Coordinates are sent to backend (stored if offline)
4. Backend queues coordinate processing
5. Worker fetches satellite images
6. Images are processed and stored
7. Results are available to farmer

## 🛡️ Security Features

- JWT authentication
- Password hashing
- Rate limiting
- CORS protection
- Data encryption
- Secure file storage

## 📦 Docker Support

The project includes Docker support for easy deployment:

