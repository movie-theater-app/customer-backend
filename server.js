const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const theatersRouter = require('./models/test-adding-theaters');
const auditoriumsRouter = require('./models/test-adding-auditoriums');
const moviesRouter = require('./models/movies');
const schedulesRouter = require('./models/schedules');

app.use(express.json());

app.get('/', (req, res) =>  {
    res.send('Hello world from NorthStar Movie theatre!')
});

app.use('/theaters', theatersRouter);
app.use('/auditoriums', auditoriumsRouter);
app.use('/movies', moviesRouter);
app.use('/schedules', schedulesRouter);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
