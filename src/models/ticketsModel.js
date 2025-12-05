const db = require("../db/db");

async function createTicketsBeforePayment(booking_id,price, child_disc){
    try {
        const query = `
        INSERT INTO tickets
        (booking_id, price, child_discount)
        VALUES ($1, $2, $3)
        RETURNING *`

        const result = await db.query(query, [booking_id, price, child_disc]);

        return result.rows;
    } catch (error) {
        console.error("Error creating tickets (before payment):", error);
        throw error;
    }
}

module.exports = {
    createTicketsBeforePayment,
}