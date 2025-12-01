-- USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role BOOLEAN NOT NULL,
    email VARCHAR UNIQUE NOT NULL );

-- THEATERS
CREATE TABLE IF NOT EXISTS theaters (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    address VARCHAR UNIQUE NOT NULL,
    contact_information TEXT UNIQUE NOT NULL );

-- THEME
CREATE TABLE IF NOT EXISTS theme (
    id SERIAL PRIMARY KEY,
    theater_id INT REFERENCES theaters(id) ON DELETE CASCADE,
    logo VARCHAR,
    color_scheme VARCHAR );

-- AUDITORIUMS
CREATE TABLE IF NOT EXISTS auditoriums (
    id SERIAL PRIMARY KEY,
    theater_id INT NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    seat_count INT NOT NULL,
    UNIQUE (theater_id, name) );


-- SEATS
CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    auditorium_id INT NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
    seat_number INT NOT NULL,
    seat_type VARCHAR,
    seat_row VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'available',
    reserve_hold_expires_at TIMESTAMPTZ,
    UNIQUE (auditorium_id, seat_row, seat_number)
);

-- MOVIES
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR UNIQUE NOT NULL,
    trailer_url VARCHAR NOT NULL,
    genre VARCHAR NOT NULL,
    duration_minutes INT NOT NULL,
    description TEXT NOT NULL,
    poster_url VARCHAR UNIQUE NOT NULL,
    age_rating VARCHAR );

--SCHEDULES
SET TIME ZONE 'Europe/Helsinki';
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,  
    movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    theater_id INT NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
    auditorium_id INT NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
    screening_date DATE NOT NULL,
    start_time TIME WITH TIME ZONE NOT NULL,
    end_time TIME WITH TIME ZONE NOT NULL,
    CONSTRAINT unique_screening_per_auditorium
        UNIQUE (auditorium_id, screening_date, start_time, end_time)
);

--SHOWTIME_SEATS
CREATE TABLE IF NOT EXISTS showtime_seats (
    id SERIAL PRIMARY KEY,
    schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    seat_id INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    reserve_hold_expires_at TIMESTAMP,
    UNIQUE(schedule_id, seat_id)
);
-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    total_amount DECIMAL NOT NULL,
    payment_status VARCHAR NOT NULL,
    reserved_until TIMESTAMP
);

-- BOOKING_SEATS
CREATE TABLE IF NOT EXISTS booking_seats (
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE (booking_id, seat_id)
);

-- TICKETS
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    price DECIMAL NOT NULL,
    child_discount BOOLEAN DEFAULT FALSE NOT NULL,
    qr_code VARCHAR UNIQUE,
    barcode_number VARCHAR UNIQUE NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE NOT NULL
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_processor VARCHAR NOT NULL,
    payment_reference VARCHAR UNIQUE,
    paid_at TIMESTAMP NOT NULL,
    amount DECIMAL NOT NULL,
    status VARCHAR NOT NULL
);

-- STATISTICS
CREATE TABLE IF NOT EXISTS statistics (
    id SERIAL PRIMARY KEY,
    movie_id INT NOT NULL REFERENCES movies(id) ON DELETE SET NULL,
    theater_id INT NOT NULL REFERENCES theaters(id) ON DELETE SET NULL,
    auditorium_id INT NOT NULL REFERENCES auditoriums(id) ON DELETE SET NULL,
    tickets_sold INT NOT NULL,
    total_revenue DECIMAL NOT NULL,
    report_month INT NOT NULL,
    report_year INT NOT NULL,
    UNIQUE(movie_id, theater_id, auditorium_id, report_month, report_year)
);

-- MOVIE_INFORMATION
CREATE TABLE IF NOT EXISTS movie_information (
    id SERIAL PRIMARY KEY,
    api_movie_id VARCHAR UNIQUE NOT NULL,
    movie_id INT UNIQUE NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    review TEXT,
    data TEXT );