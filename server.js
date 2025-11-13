const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const PORT = process.env.PORT || 3001;
const theatersRouter = require('./theaters');
//const auditoriumRoutes = require('./src/routes/auditoriumRoutes');
//const reservationRoutes = require('./src/routes/reservationRoutes');

app.use(cors());
app.use(express.json());
// see documentation at http://localhost:3001/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) =>  {
    res.send('Hello world from NorthStar Movie theatre!')
});

app.use('/theaters', theatersRouter);
//app.use('/auditoriums', auditoriumRoutes);
//app.use('/reservations', reservationRoutes);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
