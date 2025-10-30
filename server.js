const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) =>  {
    res.json({message: 'Hello world from NorthStar Movie theatre!'})
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
