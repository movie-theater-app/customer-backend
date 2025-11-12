const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const theatersRouter = require('./theaters');

app.use(express.json());

app.get('/', (req, res) =>  {
    res.send('Hello world from NorthStar Movie theatre!')
});

app.use('/theaters', theatersRouter);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
