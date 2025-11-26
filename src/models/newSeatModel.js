const db = require('../db/db');

// get seats for a specific showtime
async function getSeatsByShowtime(scheduleId) {
  const result = await db.query(
    `SELECT ss.id AS showtime_seat_id,
            s.seat_row AS row,
            s.seat_number AS number,
            s.seat_type,
            ss.status
     FROM showtime_seats ss
     JOIN seats s ON ss.seat_id = s.id
     WHERE ss.schedule_id = $1
     ORDER BY s.seat_row, s.seat_number`,
    [scheduleId]
  );

  // get auditorium info for layout
  const auditoriumResult = await db.query(
    `SELECT a.seat_count
     FROM auditoriums a
     JOIN seats s ON s.auditorium_id = a.id
     JOIN showtime_seats ss ON ss.seat_id = s.id
     WHERE ss.schedule_id = $1
     LIMIT 1`,
    [scheduleId]
  );

  const seatCount = auditoriumResult.rows[0].seat_count;

  function calculateColumns(seatCount) {
    if (seatCount <= 80) return 12;
    if (seatCount <= 150) return 15;
    if (seatCount <= 200) return 18;
    return 22;
  }

  const columns = calculateColumns(seatCount);
  const rows = Math.ceil(seatCount / columns);

  return { seats: result.rows, rows, columns };
}

// reserve seats temporarily
async function reserveSeats(scheduleId, selectedSeats) {
  if (!selectedSeats || selectedSeats.length === 0) return { success: false };

  // query for checking already reserved seats
  const conditions = [];
  const values = [scheduleId];
  selectedSeats.forEach((seat, i) => {
    values.push(seat.row, seat.number);
    conditions.push(`(s.seat_row = $${2*i+2} AND s.seat_number = $${2*i+3})`);
  });

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

  return { success: true };
}

// release expired reservations every minute
setInterval(async () => {
  await db.query(
    `UPDATE showtime_seats
     SET status = 'available',
         reserve_hold_expires_at = NULL
     WHERE status = 'reserved' AND reserve_hold_expires_at <= NOW()`
  );
}, 60 * 1000);

module.exports = { getSeatsByShowtime, reserveSeats, releaseSeats };
