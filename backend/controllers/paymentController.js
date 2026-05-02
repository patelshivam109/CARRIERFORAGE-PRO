const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    Create Stripe checkout session for Pro plan
// @route   POST /api/payment/create-checkout
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
      metadata: { userId: user._id.toString() },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session.' });
  }
};

// @desc    Create customer portal session to manage subscription
// @route   POST /api/payment/portal
// @access  Private
const createPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.stripeCustomerId) {
      return res.status(400).json({ success: false, message: 'No subscription found.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create portal session.' });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payment/webhook
// @access  Public (Stripe signed)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;

        if (session.subscription) {
          await User.findByIdAndUpdate(userId, {
            plan: 'pro',
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'active',
          });
          console.log(`✅ User ${userId} upgraded to Pro`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = customer.metadata.userId;

        const status = subscription.status === 'active' ? 'active' : subscription.status;
        const plan = subscription.status === 'active' ? 'pro' : 'free';

        await User.findByIdAndUpdate(userId, {
          plan,
          subscriptionStatus: status,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = customer.metadata.userId;

        await User.findByIdAndUpdate(userId, {
          plan: 'free',
          subscriptionStatus: 'cancelled',
          stripeSubscriptionId: null,
        });
        console.log(`📉 User ${userId} downgraded to Free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        const userId = customer.metadata.userId;
        await User.findByIdAndUpdate(userId, { subscriptionStatus: 'past_due' });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

// @desc    Get subscription status
// @route   GET /api/payment/status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription status.' });
  }
};

module.exports = { createCheckoutSession, createPortalSession, handleWebhook, getSubscriptionStatus };
