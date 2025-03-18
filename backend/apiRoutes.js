import fetch from 'node-fetch';

// API routes function
export function setupApiRoutes(app) {
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
}
