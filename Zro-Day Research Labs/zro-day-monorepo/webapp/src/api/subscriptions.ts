// ZRO-DAY Security Platform - Subscription Management API

import { Hono } from 'hono';
import { AuthContext } from '../middleware/auth.js';
import { SUBSCRIPTION_FEATURES } from '../types/security.js';

const subscriptionRoutes = new Hono();

// Get current subscription details
subscriptionRoutes.get('/current', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const features = SUBSCRIPTION_FEATURES[user.subscription_type];

    return c.json({
      subscription: {
        type: user.subscription_type,
        status: user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date() ? 'expired' : 'active',
        expires_at: user.subscription_expires_at,
        created_at: user.subscription_created_at
      },
      features,
      usage: {
        api_calls_today: user.api_calls_today,
        api_calls_this_month: user.api_calls_this_month,
        daily_limit: features.daily_scans,
        monthly_limit: features.api_calls_per_day * 30
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return c.json({ error: 'Failed to retrieve subscription details' }, 500);
  }
});

// Get available subscription plans
subscriptionRoutes.get('/plans', async (c: AuthContext) => {
  const plans = [
    {
      id: 'free',
      name: 'Reconnaissance',
      price_monthly: 0,
      price_yearly: 0,
      features: SUBSCRIPTION_FEATURES.free,
      description: 'Basic protection protocol',
      popular: false
    },
    {
      id: 'premium',
      name: 'Tactical',
      price_monthly: 7.77,
      price_yearly: 77.77,
      features: SUBSCRIPTION_FEATURES.premium,
      description: 'Advanced threat detection and real-time protection',
      popular: true,
      savings_yearly: '16% savings'
    }
  ];

  return c.json({ plans });
});

// Create subscription checkout (mock implementation)
subscriptionRoutes.post('/checkout', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const { plan_id, billing_cycle } = await c.req.json();
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (user.subscription_type === 'god') {
      return c.json({ error: 'God accounts cannot change subscriptions' }, 403);
    }

    if (!['premium'].includes(plan_id)) {
      return c.json({ error: 'Invalid plan selected' }, 400);
    }

    if (!['monthly', 'yearly'].includes(billing_cycle)) {
      return c.json({ error: 'Invalid billing cycle' }, 400);
    }

    const amount = billing_cycle === 'monthly' ? 777 : 7777; // cents
    
    // In production, integrate with Stripe, PayPal, etc.
    const checkoutUrl = `https://checkout.zro-day.com?plan=${plan_id}&cycle=${billing_cycle}&user=${user.id}`;
    
    return c.json({
      checkout_url: checkoutUrl,
      amount_cents: amount,
      currency: 'USD',
      plan: plan_id,
      billing_cycle
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return c.json({ error: 'Failed to create checkout session' }, 500);
  }
});

// Webhook endpoint for payment processing (mock)
subscriptionRoutes.post('/webhook/payment', async (c: AuthContext) => {
  try {
    const { user_id, plan_id, billing_cycle, transaction_id, status } = await c.req.json();

    if (status === 'completed') {
      const expiresAt = billing_cycle === 'yearly' ?
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() :
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Update user subscription
      await c.env.DB.prepare(`
        UPDATE users 
        SET subscription_type = ?, subscription_expires_at = ?, 
            subscription_created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(plan_id, expiresAt, user_id).run();

      // Record payment transaction
      await c.env.DB.prepare(`
        INSERT INTO payment_transactions (
          user_id, amount_cents, currency, subscription_type, transaction_type,
          payment_processor, processor_transaction_id, status, processed_at, created_at
        ) VALUES (?, ?, 'USD', ?, 'payment', 'stripe', ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        user_id,
        billing_cycle === 'yearly' ? 7777 : 777,
        plan_id,
        transaction_id
      ).run();
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('Payment webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export { subscriptionRoutes };
