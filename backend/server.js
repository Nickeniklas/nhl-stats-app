import express from 'express';
import cors from 'cors';
import { setupApiRoutes } from './apiRoutes.js'; // routes script

const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(cors());

// Serve static files from the "frontend" directory
app.use(express.static('frontend'));

// API-routes setup file
setupApiRoutes(app);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});