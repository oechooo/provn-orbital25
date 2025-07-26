# Cron Service Documentation

## Overview
The CronService automatically handles scheduled tasks for the Provn application, particularly market resolution based on the `nextResolve` timestamps.

## Features

### Automatic Market Resolution
- **Schedule**: Runs every hour (`0 * * * *`)
- **Function**: Checks for markets where `nextResolve <= current time` and `closed = false`
- **Process**: Automatically calls `MarketService.resolveMarket()` for each due market
- **Error Handling**: Continues processing other markets even if one fails

### Logging
- Comprehensive logging for all operations
- Error tracking for failed resolutions
- Summary reports after each run

## Usage

### Starting the Service
The cron service starts automatically when the server starts:

```typescript
import { CronService } from './services/CronService';

const cronService = new CronService(prisma);
cronService.startAll(); // Starts all cron jobs
```

### Manual Operations
```typescript
// Manually trigger market resolution
await cronService.triggerMarketResolution();

// Stop all cron jobs
cronService.stopAll();

// Stop specific job
cronService.stop('marketResolution');
```

## Testing

### Run Test Script
```bash
npm run test:cron
```

This script will:
- Show all current markets
- List markets due for resolution
- Test manual trigger functionality

## Configuration

### Cron Schedule
The market resolution job runs every hour. To change the schedule, modify the cron expression in `CronService.ts`:

```typescript
// Current: every hour
const task = cron.schedule('0 * * * *', ...)

// Examples:
// Every 30 minutes: '*/30 * * * *'
// Every 6 hours: '0 */6 * * *'
// Daily at midnight: '0 0 * * *'
```

### Timezone
The cron service runs in UTC timezone to ensure consistency across different deployment environments.

## Market Resolution Logic

When a market is due for resolution:

1. **Check if contentious**: If the market doesn't have strong confidence in either direction, it may fail to auto-resolve
2. **Resolve stakes**: All unresolved stakes in the current period are processed
3. **Update timing**: Market gets new resolution schedule or is closed based on `resolveCount`:
   - After 1st resolution: next resolve in 1 month
   - After 2nd resolution: next resolve in 6 months  
   - After 3rd resolution: market is closed

## Error Handling

- Individual market resolution failures don't stop the entire process
- All errors are logged with market ID and error details
- Failed resolutions are tracked and reported in the summary
- The service continues running even if some markets fail to resolve

## Monitoring

Check the server logs for cron service activity:
- `[CronService]` prefix indicates cron-related log entries
- Regular status updates every hour when the job runs
- Error logs for any failed operations

## Dependencies

- `node-cron`: For scheduling recurring tasks
- `@prisma/client`: For database operations
- `MarketService`: For market resolution logic
