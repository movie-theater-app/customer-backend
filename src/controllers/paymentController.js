const BASE_URL = process.env.VITE_BASE_URL;
const Stripe = require('stripe');
const req = require("express/lib/request");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
});
const paymentModel = require("../models/paymentModel");
const db = require("../db/db");
const nodemailer = require("nodemailer");

async function createCheckoutSession (req, res) {
    const { items, email, booking_id } = req.body;

    if(!items) return res.status(400).send("An item is required");
    if(!email) return res.status(400).send("Email is required");
    try {
        let lineItems  = [];
        items.forEach((item) => {
            const newItem = {
                price_data: {
                    currency: 'EUR',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price,
                },
                quantity: item.quantity,
            };
            lineItems.push(newItem);
        })


        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            ui_mode: 'custom',
            customer_email: email,
            return_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking_id}`,
        });


        res.json({client_secret: session.client_secret});
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }

}

async function getCheckoutSessionStatus (req, res) {
    const { session_id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const lineItems = await stripe.checkout.sessions.listLineItems(session_id,);
        res.json ({
            session,
            items: lineItems
        })
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(404).json({ error: error.message });
    }
}

async function createTickets (req, res) {
    const { booking_id, price, child_discount} = req.body;

    try {
        const result = await paymentModel.createTickets(booking_id,price,child_discount);
        res.json(result);
    } catch (error) {
        console.error('Error creating ticket', error);
        res.status(500).json({ error: error.message });
    }
}

async function updateTickets (req, res) {
    const {  tickets, is_paid} = req.body;

    try {
        const result = await paymentModel.updateTickets(tickets,is_paid);
        res.json(result);
    } catch (error) {
        console.error('Error updating tickets', error);
        res.status(400).json({ error: error.message });
    }
}
async function createPayment (req, res) {
    const { booking_id, session_id, paid_at, amount } = req.body;

    try {
        const result = await paymentModel.createPayment(booking_id,session_id,paid_at, amount);
        res.json(result);
    } catch (error) {
        console.error('Error creating payments', error);
        res.status(500).json({ error: error.message });
    }
}


// EMAIL SEND AND CREATION
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "casimir93@ethereal.email",
        pass: "dQ4PDZrF5sHUb1wykk",
    },
});

async function sendEmail (req, res) {
    try{
        const { email, receipt } = req.body;
        const info = await transporter.sendMail({
            from: '"North Star Theatre" <casimir93@ethereal.email>',
            to: email,
            subject: '"Tickets purchase"',
            text: "Tickets receipt",
            html: ticketsReceipt(receipt)
        })
        console.log("Message sent:", info.messageId)
        res.status(201).send({ success: true, messageId: info.messageId, preview: nodemailer.getTestMessageUrl(info) })
    } catch (error) {
        console.error('Error sending email', error);
        res.status(500).json({ error: error.message });
    }

}

function ticketsReceipt(receipt) {
    const ticketBlocks = receipt.tickets
        .map(
            (ticket) => `
        <div style="margin-bottom: 10px;">
          <p>${ticket.child_discount ? "Child Ticket" : "Adult Ticket"}</p>
          <p>Price: ${ticket.price}</p>
          <p>Barcode Number: ${ticket.barcode_number}</p>
          <p>Seat Type: ${ticket.seat_type}</p>
          <p>Seat Number: ${ticket.seat_number}</p>
          <p>Seat Row: ${ticket.seat_row}</p>
        </div>
      `
        )
        .join("");

    return `
    <div>
      <h2> MOVIE: ${receipt.title}</h2>
      <h4> DATE: ${receipt.date}</h4>
      <h4> TIME: ${receipt.start_time} - ${receipt.end_time}</h4>
      <p> THEATER: ${receipt.theater}</p>
      <p> AUDITORIUM: ${receipt.auditorium}</p>

      ${ticketBlocks}

      ${
        receipt.childTickets > 0
            ? `<p>Number of child tickets: ${receipt.childTickets}. Price: ${receipt.childPrice}. Total: ${
                receipt.childTickets * receipt.childPrice
            }</p>`
            : ""
    }

      ${
        receipt.normalTickets > 0
            ? `<p>Number of adult tickets: ${receipt.normalTickets}. Price: ${receipt.normalPrice}. Total: ${
                receipt.normalTickets * receipt.normalPrice
            }</p>`
            : ""
    }

      <p>Number of tickets: ${receipt.normalTickets + receipt.childTickets}</p>
      <p>Total Price: ${receipt.totalPrice}</p>
    </div>
  `;
}


module.exports = {
    createCheckoutSession,
    getCheckoutSessionStatus,
    createTickets,
    updateTickets,
    createPayment,
    sendEmail
}