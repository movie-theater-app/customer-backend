const db = require("../db/db");
const nodemailer = require("nodemailer");

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

function generateBarcodeNumber(length = 16) {
    const BARCODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        const idx = Math.floor(Math.random() * BARCODE_ALPHABET.length);
        code += BARCODE_ALPHABET[idx];
    }
    return code;
}

async function generateUniqueBarcode() {
    let barcode;
    let exists;
    do {
        barcode = generateBarcodeNumber(16);
        exists = await checkBarcodeExists(barcode);
    } while (exists);

    return barcode;
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

async function checkBarcodeExists(barcode_number) {
    const query = `
        SELECT 1
        FROM tickets
        WHERE barcode_number = $1
        LIMIT 1;
    `;

    const result = await db.query(query, [barcode_number]);
    return result.rowCount > 0;
}


async function createPayment (booking_id, session_id, paid_at, amount){
    const query = `
    INSERT INTO payments
    (booking_id, payment_processor, payment_reference, paid_at, amount, status)
    VALUES
    ($1,$2,$3,to_timestamp($4),$5, $6)
    RETURNING *;`

    const result = await db.query(query, [booking_id, "Stripe", session_id, paid_at, amount, "paid"]);

    return result.rows;

}
module.exports = {
    createTickets,
    updateTickets,
    createPayment,
    generateUniqueBarcode,
};