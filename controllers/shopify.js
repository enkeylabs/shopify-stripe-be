require('dotenv').config();
const { Router } = require('express');
const axios = require('axios');
const Shopify = require('shopify-api-node');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Shopify API client
const router = Router();
const SHOPIFY_API_ACCESS_TOKEN = process.env.SHOPIFY_API_ACCESS_TOKEN;

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_DOMAIN,
  accessToken: SHOPIFY_API_ACCESS_TOKEN || process.env.SHOPIFY_API_ACCESS_TOKEN
});


router.post('/create-order', async (_req, res) => {
  try {
    const response = await axios.post('https://afee14.myshopify.com/admin/api/2023-07/orders.json', {
      "order": {
        "financial_status": "pending",
        "line_items": [
          {
            "variant_id": 45556599292191,
            "quantity": 1
          }
        ],
        "test": true,    
        "transactions": [
          {
            "test": true,
            "kind": "authorization",
            "status": "success",
            "amount": 1
          }
        ]
      }
    }, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_API_ACCESS_TOKEN
      }
    })
    const { order } = response.data
    console.log("🚀 ~ file: shopify.js:33 ~ createOrder ~ order:", order);

    return res.status(200).json({ order });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(400).json({ message: 'Error creating order' });
  }
})

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'sgd',
      description: `${orderId}`,
      payment_method_types: ['card'],
      amount: Math.round(100 * parseFloat(`${amount}`)),
    });
    console.log("🚀 ~ file: shopify,js:41 ~ createOrder ~ paymentIntent:", paymentIntent);

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return res.status(400).json({ message: 'Error creating payment intent' });
  }
})

router.post('/payment-confirmation', async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const transactions = await shopify.transaction.list(orderId);
    const crrTransaction = transactions[0];
    const createTransaction = await shopify.transaction.create(orderId, {
      test: true,
      kind: 'capture',
      status: 'success',
      amount: '1.00',
      gateway: 'stripe',
      parent_id: crrTransaction.id,
      authorization: paymentIntentId
    });

    console.log("🚀 ~ file: shopify.js:77 ~ router.post ~ createTransaction:", createTransaction)
    const order = await shopify.order.get(orderId);

    return res.status(200).json({ message: 'Payment successfull!', data: order });
  } catch (err) {
    console.error('Error payment confirmation:', err);
    console.log("🚀 ~ file: shopify.js:82 ~ router.post ~ err:", err?.response)
    return res.status(400).json({ message: 'Error payment confirmation' });
  }
});

module.exports = router;
