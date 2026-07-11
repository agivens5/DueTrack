const express = require('express');
const cors = require('cors');
const path = require('path');

const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`DueTrack running at http://localhost:${PORT}`);
    });
}

module.exports = app;