const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/index');

const authRoutes = require('./routes/auth');
const endpointRoutes = require('./routes/endpoints');
const logsRoutes = require('./routes/logs');
const aiRoutes = require('./routes/ai');
const chainRoutes = require('./routes/chains');


require('./workers/pingWorker');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/endpoints', endpointRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chains', chainRoutes);



app.get('/', (req, res) => res.json({ message: '🚀 PingMyAPI server running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));