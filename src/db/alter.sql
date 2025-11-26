-- THEME
ALTER TABLE theme
    DROP CONSTRAINT IF EXISTS theme_theater_id_fkey,
    ADD CONSTRAINT theme_theater_id_fkey FOREIGN KEY (theater_id)
    REFERENCES theaters(id) ON DELETE CASCADE;

-- AUDITORIUMS
ALTER TABLE auditoriums
    DROP CONSTRAINT IF EXISTS auditoriums_theater_id_fkey,
    ADD CONSTRAINT auditoriums_theater_id_fkey FOREIGN KEY (theater_id)
    REFERENCES theaters(id) ON DELETE CASCADE;

-- SEATS
ALTER TABLE seats
    DROP CONSTRAINT IF EXISTS seats_auditorium_id_fkey,
    ADD CONSTRAINT seats_auditorium_id_fkey FOREIGN KEY (auditorium_id)
    REFERENCES auditoriums(id) ON DELETE CASCADE;

-- SCHEDULES
ALTER TABLE schedules
    DROP CONSTRAINT IF EXISTS schedules_movie_id_fkey,
    DROP CONSTRAINT IF EXISTS schedules_theater_id_fkey,
    DROP CONSTRAINT IF EXISTS schedules_auditorium_id_fkey,
    ADD CONSTRAINT schedules_movie_id_fkey FOREIGN KEY (movie_id)
        REFERENCES movies(id) ON DELETE CASCADE,
    ADD CONSTRAINT schedules_theater_id_fkey FOREIGN KEY (theater_id)
        REFERENCES theaters(id) ON DELETE CASCADE,
    ADD CONSTRAINT schedules_auditorium_id_fkey FOREIGN KEY (auditorium_id)
        REFERENCES auditoriums(id) ON DELETE CASCADE;

-- BOOKINGS
ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS bookings_schedule_id_fkey,
    ADD CONSTRAINT bookings_schedule_id_fkey
        FOREIGN KEY (schedule_id)
        REFERENCES schedules(id)
        ON DELETE CASCADE;
ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS bookings_movie_id_fkey,
    ADD CONSTRAINT bookings_movie_id_fkey
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE;

-- BOOKING_SEATS
ALTER TABLE booking_seats
    DROP CONSTRAINT IF EXISTS booking_seats_booking_id_fkey,
    DROP CONSTRAINT IF EXISTS booking_seats_seat_id_fkey,
    ADD CONSTRAINT booking_seats_booking_id_fkey FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE,
    ADD CONSTRAINT booking_seats_seat_id_fkey FOREIGN KEY (seat_id)
        REFERENCES seats(id) ON DELETE CASCADE;

-- TICKETS
ALTER TABLE tickets
    DROP CONSTRAINT IF EXISTS tickets_booking_id_fkey,
    ADD CONSTRAINT tickets_booking_id_fkey FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE;

-- PAYMENTS
ALTER TABLE payments
    DROP CONSTRAINT IF EXISTS payments_booking_id_fkey,
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE;

-- STATISTICS
ALTER TABLE statistics
    DROP CONSTRAINT IF EXISTS statistics_movie_id_fkey,
    DROP CONSTRAINT IF EXISTS statistics_theater_id_fkey,
    DROP CONSTRAINT IF EXISTS statistics_auditorium_id_fkey,
    ADD CONSTRAINT statistics_movie_id_fkey FOREIGN KEY (movie_id)
        REFERENCES movies(id) ON DELETE SET NULL,
    ADD CONSTRAINT statistics_theater_id_fkey FOREIGN KEY (theater_id)
        REFERENCES theaters(id) ON DELETE SET NULL,
    ADD CONSTRAINT statistics_auditorium_id_fkey FOREIGN KEY (auditorium_id)
        REFERENCES auditoriums(id) ON DELETE SET NULL;

-- MOVIE_INFORMATION
ALTER TABLE movie_information
    DROP CONSTRAINT IF EXISTS movie_information_movie_id_fkey,
    ADD CONSTRAINT movie_information_movie_id_fkey FOREIGN KEY (movie_id)
        REFERENCES movies(id) ON DELETE CASCADE;