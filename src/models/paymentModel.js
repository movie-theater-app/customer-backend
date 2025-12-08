const db = require("../db/db");

// First creation of the tickets when the user select the ticket type
async function createTickets (booking_id, price, child_discount) {
    const query =`
        INSERT INTO tickets
        (booking_id, price, child_discount)
        VALUES
        ($1,$2,$3)
        RETURNING *;
    `;

    const result = await db.query(query, [booking_id, price, child_discount]);

    if(result.rowCount === 0){
        console.log(`Error adding ticket in booking with id ${booking_id}`);
        return null;
    }

    return result.rows[0];
}

async function updateTickets (tickets, is_paid) {
    const ids = tickets.map((t) => t.id);
    const barcodes = tickets.map((t) => t.barcode_number);
    const query =`
    UPDATE tickets as t
    SET is_paid = $3,
        barcode_number = b.barcode_number
    FROM (
        SELECT 
            UNNEST($1::int[]) AS id,
            UNNEST($2::text[]) AS barcode_number
    ) AS b
    WHERE t.id = b.id
    RETURNING t.*;`;

    const result = await db.query(query, [ids, barcodes, is_paid]);

    return result.rows;
}

// Queries for statistics
async function updateStatistics(tickets) {
    const ticketIds = tickets.map(t => t.id);
    
    const statsQuery = `
    SELECT 
        b.movie_id,
        s.theater_id,
        s.auditorium_id,
        COUNT(t.id) as tickets_sold,
        p.amount as total_revenue,
        EXTRACT(MONTH FROM NOW()) as report_month,
        EXTRACT(YEAR FROM NOW()) as report_year
    FROM tickets t
    JOIN bookings b ON t.booking_id = b.id
    JOIN schedules s ON b.schedule_id = s.id
    JOIN payments p ON p.booking_id = b.id
    WHERE t.id = ANY($1)
    GROUP BY b.movie_id, s.theater_id, s.auditorium_id, p.amount
    `;
    
    const statsResult = await db.query(statsQuery, [ticketIds]);
    
    if (statsResult.rows.length > 0) {
        const stats = statsResult.rows[0];
        
        const pushQuery = `
        INSERT INTO statistics (movie_id, theater_id, auditorium_id, tickets_sold, total_revenue, report_month, report_year)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (movie_id, theater_id, auditorium_id, report_month, report_year)
        DO UPDATE SET
            tickets_sold = statistics.tickets_sold + EXCLUDED.tickets_sold,
            total_revenue = statistics.total_revenue + EXCLUDED.total_revenue
        RETURNING *;
        `;
        
        await db.query(pushQuery, [
            stats.movie_id,
            stats.theater_id,
            stats.auditorium_id,
            stats.tickets_sold,
            stats.total_revenue,
            stats.report_month,
            stats.report_year
        ]);
    }
}

async function createPayment (booking_id, session_id, paid_at, amount){
    const query = `
    INSERT INTO payments
    (booking_id, payment_processor, payment_reference, paid_at, amount, status)
    VALUES
    ($1,$2,$3,to_timestamp($4),$5, $6)
    RETURNING *;`

    const result = await db.query(query, [booking_id, "Stripe", session_id, paid_at, amount, "paid"]);

    // Update statistics after payment
    const ticketsQuery = `SELECT * FROM tickets WHERE booking_id = $1`;
    const ticketsResult = await db.query(ticketsQuery, [booking_id]);
    if (ticketsResult.rows.length > 0) {
        await updateStatistics(ticketsResult.rows);
    }

    return result.rows;

}
module.exports = {
    createTickets,
    updateTickets,
    createPayment
};