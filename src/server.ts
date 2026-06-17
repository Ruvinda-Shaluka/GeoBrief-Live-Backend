import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start the Server (Only for local development, ignored in Serverless Vercel)
app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
});