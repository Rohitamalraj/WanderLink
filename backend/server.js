const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const identityRoutes = require('./ocr/identityRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend dev
app.use(cors());

// For parsing application/json
app.use(bodyParser.json({ limit: '10mb' }));
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads (for debugging, not for production)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount identity verification routes
app.use('/api/identity', identityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend server is running.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
