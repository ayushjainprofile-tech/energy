const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Note: Ensure you have a LOCAL MongoDB or an ATLAS URI in .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/energyAudit';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error. Starting without DB (history will not be saved).', err.message));

const auditSchema = new mongoose.Schema({
  facilityType: String,
  data: Object,
  auditResult: Object,
  createdAt: { type: Date, default: Date.now }
});
const Audit = mongoose.model('Audit', auditSchema);

app.post('/api/audit', async (req, res) => {
  try {
    const energyData = req.body;
    
    // Call the AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await axios.post(`${aiServiceUrl}/analyze`, energyData);
    const auditResult = aiResponse.data;
    
    if (mongoose.connection.readyState === 1) {
       const newAudit = new Audit({
           facilityType: energyData.facilityType,
           data: energyData,
           auditResult: auditResult
       });
       await newAudit.save();
    }
    
    res.json(auditResult);
  } catch (error) {
    console.error('Error during audit:', error.message);
    res.status(500).json({ error: 'Failed to process audit' });
  }
});

app.get('/api/history', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json([]); 
        }
        const history = await Audit.find().sort({ createdAt: -1 }).limit(10);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
