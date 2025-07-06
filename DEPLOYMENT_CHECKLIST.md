# Quick Deployment Checklist

## Before Deployment

- [ ] Get News API key from https://newsapi.org/
- [ ] Commit all changes to Git
- [ ] Verify backend builds locally: `cd backend && npm run build`
- [ ] Verify frontend builds locally: `cd frontend && npm run build`

## Render Setup

- [ ] Create Render account at https://render.com
- [ ] Connect GitHub repository
- [ ] Use Blueprint deployment with `render.yaml`
- [ ] Set `NEWS_API_KEY` environment variable in backend service

## Post-Deployment Verification

- [ ] Backend health check responds with "OK"
- [ ] Frontend loads without errors
- [ ] Can create user account
- [ ] JWT authentication works (tokens never expire)
- [ ] CORS is properly configured

## URLs

- Backend: `https://provn-orbital25-backend.onrender.com`
- Frontend: `https://provn-orbital25-frontend.onrender.com`
- Health Check: `https://provn-orbital25-backend.onrender.com/health`

## Common Issues

1. **Build Fails**: Check TypeScript compilation errors
2. **Health Check Fails**: Check database initialization logs
3. **CORS Errors**: Verify frontend URL in backend CORS settings
4. **Authentication Issues**: Verify JWT_SECRET is set

## Quick Commands

```bash
# Local development
cd backend && npm run dev
cd frontend && npm run dev

# Local build test
cd backend && npm run build
cd frontend && npm run build

# Database reset (local)
cd backend && npx prisma db push --force-reset
```
