const BASE_URL = process.env.VITE_BASE_URL;
const Stripe = require('stripe');
const req = require("express/lib/request");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
});

async function createCheckoutSession (req, res) {
    const { item, quantity, email } = req.body;

    if(!item) return res.status(400).send("Item is required");
    if(!quantity) return res.status(400).send("Quantity is required");
    if(!email) return res.status(400).send("Email is required");
    try {
        const newItem = {
            price_data: {
                currency: 'EUR',
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price,
            },
            quantity: quantity,
        };

        console.log('Creating checkout session for item:', newItem);
        const session = await stripe.checkout.sessions.create({
            line_items: [
                newItem,
            ],
            mode: 'payment',
            ui_mode: 'custom',
            customer_email: email,
            return_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`
        });

        console.log('Created checkout session:', session);

        res.json({client_secret: session.client_secret});
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(400).json({ error: error.message });
    }

}

async function getCheckoutSessionStatus (req, res) {
    const { session_id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        res.json ({
            id: session.id,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_email,
        })
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
    createCheckoutSession,
    getCheckoutSessionStatus,
}