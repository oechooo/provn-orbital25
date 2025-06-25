## News API Setup Instructions

To get articles from the News API, you need to:

1. **Get a FREE News API Key:**
   - Go to https://newsapi.org/
   - Click "Get API Key" and sign up for a free account
   - Copy your API key

2. **Add the API key to your .env file:**
   - Open `backend/.env`
   - Replace `your_news_api_key_here` with your actual API key
   - Example: `NEWS_API_KEY=abc123def456ghi789`

3. **Test the integration:**
   - The backend now has an endpoint `/api/articles/refresh`
   - The frontend "Refresh News & Markets" button will call this endpoint
   - This will fetch latest news and create prediction markets automatically

## Features Added:

✅ **Article Controller** - Handles fetching and serving articles
✅ **News API Integration** - Fetches real articles from NewsAPI.org
✅ **Automatic Market Creation** - Creates prediction markets for each article
✅ **Multiple Categories** - Fetches from business, health, science, technology
✅ **Duplicate Prevention** - Avoids creating duplicate articles/markets
✅ **Error Handling** - Graceful handling of API errors and rate limits

## Free Tier Limits:
- 1,000 requests per day
- Latest news from last 30 days
- Perfect for development and testing

Once you add your API key, the app will fetch real news articles and create functional prediction markets!
