const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const PORT = process.env.PORT || 3000;

//const theatersRouter = require('./models/test-adding-theaters');
//const auditoriumsRouter = require('./models/test-adding-auditoriums');
const moviesRouter = require('./src/models/movies');
const schedulesRouter = require('./src/models/schedules');
const theatersRouter = require('./src/routes/theaterRoutes');
const auditoriumsRouter = require('./src/routes/auditoriumRoutes');
const seatRouter = require('./src/routes/seatRoutes');
const bookingsRouter = require("./src/routes/bookingRoutes");
const paymentRouter = require("./src/routes/paymentRoutes");


app.use(cors());
app.use(express.json());
// Swagger UI -> see documentation at http://localhost:3001/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) =>  {
    res.send('Hello world from NorthStar Movie theatre!')
});

// Routes
app.use('/api/theaters', theatersRouter);
app.use('/api/auditoriums', auditoriumsRouter);
app.use('/api/seats', seatRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/payment', paymentRouter);
//app.use('/theaters', theatersRouter);
//app.use('/auditoriums', auditoriumsRouter);
app.use('/movies', moviesRouter);
app.use('/schedules', schedulesRouter);
app.use("/bookings", bookingsRouter);
app.use('/payment', paymentRouter);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
