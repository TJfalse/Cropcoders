# Deployment Guide for Railway

This guide explains how to deploy the Agriculture Satellite Image Processing application on Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. Railway CLI installed (`npm i -g @railway/cli`)
3. The following services set up:
   - PostgreSQL database
   - Redis instance
   - AWS S3 bucket
   - Sentinel Hub account

## Environment Variables

Ensure these environment variables are set in Railway:

```bash
DATABASE_URL=           # PostgreSQL connection string
REDIS_URL=             # Redis connection string
JWT_SECRET=            # Secret for JWT tokens
SENTINEL_CLIENT_ID=    # Sentinel Hub Client ID
SENTINEL_CLIENT_SECRET=# Sentinel Hub Client Secret
AWS_ACCESS_KEY_ID=     # AWS Access Key
AWS_SECRET_ACCESS_KEY= # AWS Secret Key
AWS_REGION=           # AWS Region
AWS_S3_BUCKET=        # S3 Bucket name
NODE_ENV=production    # Set to production
```

## Deployment Steps

1. **Initialize Railway Project**
   ```bash
   # Login to Railway
   railway login

   # Initialize project
   railway init
   ```

2. **Create PostgreSQL Database**
   - Go to Railway Dashboard
   - Click "New Project" → "Add Database" → "PostgreSQL"
   - Railway will automatically add DATABASE_URL to your environment

3. **Create Redis Instance**
   - In Railway Dashboard
   - Click "New" → "Add Database" → "Redis"
   - Railway will automatically add REDIS_URL to your environment

4. **Deploy Main Application**
   ```bash
   # Deploy the main application
   railway up --service main-app
   ```

5. **Deploy Worker Process**
   ```bash
   # Deploy the worker as a separate service
   railway up --service worker
   ```

## Scaling

To scale the worker processes:
1. Go to Railway Dashboard
2. Select the worker service
3. Click on "Settings" → "Scaling"
4. Adjust the number of instances

## Monitoring

1. **Logs**
   - Access logs through Railway Dashboard
   - Both main app and worker logs are available separately

2. **Metrics**
   - Monitor CPU and Memory usage in Railway Dashboard
   - Set up alerts for high resource usage

3. **Health Checks**
   - The application exposes a /health endpoint
   - Railway automatically monitors this endpoint

## Troubleshooting

1. **Database Connectivity Issues**
   - Verify DATABASE_URL in environment variables
   - Check if the database is running
   - Verify network access rules

2. **Redis Connection Issues**
   - Verify REDIS_URL in environment variables
   - Check Redis service status
   - Verify network access rules

3. **Worker Not Processing Jobs**
   - Check worker logs for errors
   - Verify Redis connection
   - Check if jobs are being enqueued properly

4. **Image Processing Failures**
   - Check S3 credentials and permissions
   - Verify Sentinel Hub API access
   - Check available disk space and memory

## Best Practices

1. **Zero Downtime Deployments**
   - Railway handles this automatically
   - Ensure proper health checks are in place

2. **Backup Strategy**
   - Regular database backups (automated by Railway)
   - Keep S3 bucket versioning enabled

3. **Monitoring**
   - Set up error notifications
   - Monitor queue sizes and processing times
   - Watch for failed jobs

4. **Scaling**
   - Monitor CPU/Memory usage
   - Scale worker instances based on queue size
   - Consider time zone peak usage patterns

## Security

1. **Environment Variables**
   - Never commit .env files
   - Use Railway's environment variable management
   - Rotate secrets periodically

2. **Network Security**
   - Use Railway's built-in SSL
   - Enable CORS only for trusted origins
   - Implement rate limiting

3. **Database Security**
   - Use connection pooling
   - Implement proper indexing
   - Regular security updates

## Support

For issues:
1. Check Railway documentation
2. Review application logs
3. Contact Railway support
4. Check GitHub issues

Remember to monitor the worker processes and scale them according to your needs. Railway makes it easy to add more worker instances if needed.