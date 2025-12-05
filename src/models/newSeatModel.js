const db = require('../db/db');
const seatIDResult = require("pg/lib/query");

// get seats for a specific showtime
// this connects 3 tables with join-operation (showtime_seats, seats ans schedules)
async function getSeatsByShowtime(scheduleId) {
    console.log('scheduleId received in model:', scheduleId);
    // ensure scheduleId is provided
     if (!scheduleId) {
        console.error('scheduleId is missing!');
        throw new Error('scheduleId is required');
        }
        // ensure scheduleId is a number
        if (isNaN(scheduleId)) {
        console.error('scheduleId is not a number!');
        throw new Error('scheduleId must be a number');
        }

    try {
        // check that schedule exists
        console.log('Checking if schedule exists...');
        const scheduleCheck = await db.query(
            `SELECT id, auditorium_id FROM schedules WHERE id = $1`,
            [scheduleId]
            );
            console.log('scheduleCheck result:', scheduleCheck.rows);

        if (scheduleCheck.rows.length === 0) {
            console.error(`Schedule with id ${scheduleId} not found`);
            throw new Error(`Schedule with id ${scheduleId} not found`);
        }
        const auditoriumId = scheduleCheck.rows[0].auditorium_id;
        console.log('auditoriumId:', auditoriumId);


        // Main query -> get all seats for given showtime
        // - ss = showtime_seats alias
        // - s = seats (actual seat layout) alias
        // - sc = schedules (to get movie_id and theater_id) alias
        console.log('Fetching seats for showtime..');
        const seatsResult = await db.query(
            `SELECT ss.id AS showtime_seat_id,
                    s.id AS seat_id,
                    s.seat_row AS row,
                    s.seat_number AS number,
                    s.seat_type,
                    ss.status,
                    sc.movie_id, 
                    sc.theater_id
            FROM showtime_seats ss
            JOIN seats s ON s.id = ss.seat_id
            JOIN schedules sc ON sc.id = ss.schedule_id
            WHERE ss.schedule_id = $1
            ORDER BY s.seat_row, s.seat_number`,
            [scheduleId]
        );

        console.log('seatsResult:', seatsResult.rows);
         if (!seatsResult.rows || seatsResult.rows.length === 0) {
            console.warn(`No seats found for schedule ${scheduleId}`);
        }

        // get auditorium info for layout
        console.log('Fetching auditorium info...');
        const auditoriumResult = await db.query(
           /* `SELECT a.seat_count
            FROM auditoriums a
            JOIN seats s ON s.auditorium_id = a.id
            JOIN showtime_seats ss ON ss.seat_id = s.id
            WHERE ss.schedule_id = $1
            LIMIT 1`,
            [scheduleId]*/

            `SELECT seat_count
            FROM auditoriums WHERE id = $1`,
            [auditoriumId]

        );
        // error if no auditorium is linked to schedule
        if (auditoriumResult.rows.length === 0) {
            console.error(`Auditorium with id ${auditoriumId} not found`);
            throw new Error(`Auditorium with id ${auditoriumId} not found for schedule ${scheduleId}`);
        }

        const seatCount = auditoriumResult.rows[0].seat_count;
        console.log('seatCount:', seatCount);
        // cxalculate how many columns to show in the seat map UI (same as in staff app seat-map generating)
        function calculateColumns(seatCount) {
            if (seatCount <= 80) return 12;
            if (seatCount <= 150) return 15;
            if (seatCount <= 200) return 18;
            return 22;
        }

        const columns = calculateColumns(seatCount);
        const rows = Math.ceil(seatCount / columns); // total rows needed for seat map
        console.log('Returning seat map:', { rows, columns, seatsCount: seatsResult.rows.length });
        return { seats: seatsResult.rows, rows, columns };
        
    } catch (error) {
        console.error('Error in getSeatsByShowtime model:', error);
        throw error;
  }
}

// reserve seats temporarily
async function reserveSeats(scheduleId, selectedSeats) {
  if (!selectedSeats || selectedSeats.length === 0) return { success: false };

  const conditions = []; // dynamic WHERE conditions for multiple seats
  const values = [scheduleId];
  selectedSeats.forEach((seat, i) => {
    values.push(seat.row, seat.number); // add each seat row and number to values array
    // dynamic condition for SQL (row=X AND number=Y) -> tuple pairs
    conditions.push(`(s.seat_row = $${2*i+2} AND s.seat_number = $${2*i+3})`);  
  });
   // query for checking already reserved seats
  const reservedQuery = `
    SELECT s.seat_row, s.seat_number
    FROM showtime_seats ss
    JOIN seats s ON ss.seat_id = s.id
    WHERE ss.schedule_id = $1
      AND ss.status = 'reserved'
      AND (ss.reserve_hold_expires_at IS NULL OR ss.reserve_hold_expires_at > NOW())
      AND (${conditions.join(' OR ')})
  `;

  const reserved = await db.query(reservedQuery, values);
  console.log(`Reserving seats for scheduleId ${scheduleId}:`, selectedSeats);

  if (reserved.rows.length > 0) return { success: false, alreadyReserved: reserved.rows };

  // reserve seats for 5 minutes (temporary hold)
  for (const seat of selectedSeats) {
    await db.query(
      `UPDATE showtime_seats ss
       SET status = 'reserved',
           reserve_hold_expires_at = NOW() + INTERVAL '5 minutes'
       FROM seats s
       WHERE ss.schedule_id = $1
         AND ss.seat_id = s.id
         AND s.seat_row = $2
         AND s.seat_number = $3`,
      [scheduleId, seat.row, seat.number]
    );
  }

  return { success: true };
}

// release selected seats manually
async function releaseSeats(scheduleId, seatsToRelease) {
  if (!seatsToRelease || seatsToRelease.length === 0) return { success: false };

  for (const seat of seatsToRelease) {
    await db.query(
      `UPDATE showtime_seats ss
       SET status = 'available',
           reserve_hold_expires_at = NULL
       FROM seats s
       WHERE ss.schedule_id = $1
         AND ss.seat_id = s.id
         AND s.seat_row = $2
         AND s.seat_number = $3`,
      [scheduleId, seat.row, seat.number]
    );
  }
  console.log(`Released seats for scheduleId ${scheduleId}:`, seatsToRelease);
  return { success: true };
}

async function getSeatsByBooking (bookingID) {
    const query = `
    SELECT seat_id
    FROM booking_seats
    WHERE booking_id = $1;`;

    const seatIDResults = await db.query(query, [bookingID]);
    const seatIDs = seatIDResults.rows.map(seat => seat.seat_id);

    const querySeats = `
    SELECT *
    FROM seats
    WHERE id in (
        SELECT UNNEST($1::int[])
        )`

    const result = await db.query(querySeats, [seatIDs]);

    return result.rows;
}

// release expired reservations every minute
setInterval(async () => {
    try {
        await db.query(
            `UPDATE showtime_seats
            SET status = 'available',
                reserve_hold_expires_at = NULL
            WHERE status = 'reserved' AND reserve_hold_expires_at <= NOW()`
        );
    } catch (error) {
        console.error('Error releasing expired reservations:', error);
    }
}, 60 * 1000);

module.exports = { getSeatsByShowtime, reserveSeats, releaseSeats, getSeatsByBooking };
