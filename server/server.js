const express = require('express');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

console.log('Starting server file...');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('DueTrack API is running');
});

app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});