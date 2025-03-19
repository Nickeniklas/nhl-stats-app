import fetch from 'node-fetch';

// API routes function


export function setupApiRoutes(app) {
    // SCHEDULE NOW
    //GET https://api-web.nhle.com/v1/schedule/now
    app.get('/api/schedule/now', async (req, res) => {
        const url = "https://api-web.nhle.com/v1/schedule/now";
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    });
    // STANDINGS
    //GET https://api-web.nhle.com/v1/standings/now
    app.get('/api/standings/now', async (req, res) => {
        const url = "https://api-web.nhle.com/v1/standings/now";
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    });
}


