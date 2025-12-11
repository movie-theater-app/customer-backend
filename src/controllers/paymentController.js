const BASE_URL = process.env.VITE_BASE_URL;
const Stripe = require('stripe');
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

async function generateUniqueBarcode (req, res) {
    try {
        const result = await paymentModel.generateUniqueBarcode();
        res.json(result);
    } catch (error) {
        console.error('Error generating unique barcode', error);
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
    service: "gmail",
    auth: {
        user: "jimyrrocket@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

async function sendEmail (req, res) {
    try{
        const { email, receipt } = req.body;
        const info = await transporter.sendMail({
            from: '"North Star Theatre" <jimyrrocket@gmail.com>',
            to: email,
            subject: '"Tickets purchase"',
            text: "Tickets receipt",
            html: ticketsReceipt(receipt)
        })
        console.log("Message sent:", info.messageId)
        res.status(201).send({ success: true, messageId: info.messageId })
    } catch (error) {
        console.error('Error sending email', error);
        res.status(500).json({ error: error.message });
    }

}


function ticketsReceipt(receipt) {
    const ticketBlocks = receipt.tickets
        .map(
            (ticket) => `
      <div style="
        margin: 20px auto;
        padding: 15px;
        max-width: 420px;
        background-color: #f4fbff;
        border: 1px solid #5398ad;
        border-radius: 6px;
      ">
        <p style="margin: 4px 0; font-weight: bold;">
          ${ticket.child_discount ? "Child Ticket" : "Adult Ticket"}
        </p>
        <p style="margin: 4px 0;">Price: €${ticket.price}</p>
        <p style="margin: 4px 0;">
          <strong>Barcode:</strong> ${ticket.barcode_number}
        </p>
        <p style="margin: 4px 0;">Seat Type: ${ticket.seat_type}</p>
        <p style="margin: 4px 0;">
          Seat: Row ${ticket.seat_row}, Number ${ticket.seat_number}
        </p>
      </div>
    `
        )
        .join("");

    return `
    <div style="
      background-color: #ffffff;
      padding: 20px;
      color: #333333;
    ">
      <h2 style="margin-bottom: 5px;"> ${receipt.title}</h2>
      <p style="margin: 2px 0;"><strong>Date:</strong> ${receipt.date}</p>
      <p style="margin: 2px 0;">
        <strong>Time:</strong> ${receipt.start_time} - ${receipt.end_time}
      </p>
      <p style="margin: 2px 0;"><strong>Theater:</strong> ${receipt.theater}</p>
      <p style="margin: 2px 0;">
        <strong>Auditorium:</strong> ${receipt.auditorium}
      </p>

      ${ticketBlocks}

      <hr style="margin: 20px 0;" />

      ${
        receipt.childTickets > 0
            ? `<p>Child tickets: ${receipt.childTickets} × €${receipt.childPrice} = €${
                receipt.childTickets * receipt.childPrice
            }</p>`
            : ""
    }

      ${
        receipt.normalTickets > 0
            ? `<p>Adult tickets: ${receipt.normalTickets} × €${receipt.normalPrice} = €${
                receipt.normalTickets * receipt.normalPrice
            }</p>`
            : ""
    }

      <p><strong>Total tickets:</strong> ${
        receipt.normalTickets + receipt.childTickets
    }</p>
      <p style="font-size: 16px;">
        <strong>Total price:</strong> €${receipt.totalPrice}
      </p>

      <p style="margin-top: 25px; font-size: 12px; color: #666;">
        Please present this email at the entrance. Enjoy the movie!
      </p>
    </div>
  `;
}



module.exports = {
    createCheckoutSession,
    getCheckoutSessionStatus,
    createTickets,
    updateTickets,
    createPayment,
    sendEmail,
    generateUniqueBarcode,
}