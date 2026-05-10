import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const shopOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  address: { type: String, required: true },
  shippingZone: { type: String, enum: ['local', 'regional', 'national'], default: 'regional' },
  estimatedDeliveryDays: { type: Number, required: true },
  shippingFee: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  items: [orderItemSchema],
  status: { type: String, enum: ['confirmed', 'shipped', 'delivered'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

const ShopOrder = mongoose.models.ShopOrder || mongoose.model('ShopOrder', shopOrderSchema);

const shopProducts = [
  {
    id: 'prod-1',
    name: 'Adjustable Dumbbell Set',
    description: 'Lightweight, space-saving dumbbells for strength training at home.',
    price: 2999
  },
  {
    id: 'prod-2',
    name: 'Premium Yoga Mat',
    description: 'Non-slip exercise mat with extra cushioning for comfort.',
    price: 1299
  },
  {
    id: 'prod-3',
    name: 'Resistance Band Kit',
    description: 'Five-band resistance set for stretching, HIIT, and fitness routines.',
    price: 799
  },
  {
    id: 'prod-4',
    name: 'Gym Gloves',
    description: 'Breathable gloves for secure weightlifting and protection.',
    price: 699
  },
  {
    id: 'prod-5',
    name: 'Smart Water Bottle',
    description: 'LED hydration bottle that reminds you to drink water on time.',
    price: 1099
  },
  {
    id: 'prod-6',
    name: 'Workout Shaker Bottle',
    description: 'Leak-proof shaker with measurement markers and storage.',
    price: 499
  }
];

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.get('/products', (req, res) => {
  res.json({ success: true, products: shopProducts });
});

router.post('/order', async (req, res) => {
  try {
    const { customerName, email, phone, address, shippingZone, items, subtotal, shippingFee, total } = req.body;

    if (!customerName || !email || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing order details or cart items.' });
    }

    const shippingMap = {
      local: { days: 3, fee: 150 },
      regional: { days: 7, fee: 250 },
      national: { days: 10, fee: 350 }
    };

    const shippingOption = shippingMap[shippingZone] || shippingMap.regional;
    const estimatedDeliveryDays = shippingOption.days;
    const orderTotal = Number(total) || Number(subtotal) + shippingOption.fee;

    const normalizedItems = items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const shopOrder = new ShopOrder({
      userId: req.user ? req.user._id : undefined,
      customerName,
      email,
      phone: phone || '',
      address,
      shippingZone: shippingOption ? shippingZone : 'regional',
      estimatedDeliveryDays,
      shippingFee: shippingOption.fee,
      subtotal: Number(subtotal) || 0,
      total: orderTotal,
      items: normalizedItems
    });

    await shopOrder.save();

    try {
      console.log(`Attempting to send shop order confirmation email to: ${email}`);
      console.log(`Email transporter configured for user: ${process.env.EMAIL_USER ? 'Set' : 'Not set'}`);

      const mailOptions = {
        from: `"FitZone Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'FitZone Order Confirmation - Order Placed Successfully!',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'List-Unsubscribe': '<mailto:unsubscribe@fitzone.com>',
          'X-Mailer': 'FitZone Order System'
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #28a745; margin: 0;">✅ Your Order Placed Successfully!</h2>
            </div>
            <p>Hi ${customerName},</p>
            <p><strong>Great news!</strong> Your order has been placed successfully at FitZone.</p>
            <p><strong>You will receive your product within ${estimatedDeliveryDays} days.</strong></p>
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${shopOrder._id}</p>
              <p><strong>Total Paid:</strong> ₹${orderTotal}</p>
            </div>
            <h4>Your Order Items:</h4>
            <ul style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${normalizedItems.map(item => `<li style="margin-bottom: 5px;">${item.name} × ${item.quantity} — ₹${item.price * item.quantity}</li>`).join('')}
            </ul>
            <p><strong>Shipping Address:</strong></p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <p style="margin: 0; white-space: pre-line;">${address}</p>
            </div>
            <p><strong>Shipping Zone:</strong> ${shippingZone} (${estimatedDeliveryDays} days delivery)</p>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>📧 Important:</strong> If you don't see this email in your inbox, please check your spam/junk folder.</p>
            </div>
            <p>Thank you for shopping with FitZone! We'll keep you updated on your order status.</p>
            <p>Best regards,<br/>FitZone Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated email from FitZone. Please do not reply to this email.</p>
          </div>
        `
      };

      console.log(`Sending email with subject: ${mailOptions.subject}`);
      const emailResult = await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Shop order confirmation email sent successfully to ${email}`);
      console.log('Message ID:', emailResult.messageId);
      console.log('Email response:', emailResult.response);
    } catch (emailError) {
      console.error('❌ Shop order email error:', emailError);
      console.error('Email error details:', emailError.message);
      console.error('Email details:', {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'FitZone Order Confirmation'
      });
      // Don't fail the order if email fails - just log the error
    }

    res.json({
      success: true,
      orderId: shopOrder._id,
      estimatedDeliveryDays,
      message: `Order placed successfully! Order ID: ${shopOrder._id}. Delivery in ${estimatedDeliveryDays} days. You will receive your product within ${estimatedDeliveryDays} days.`,
      orderDetails: {
        orderId: shopOrder._id,
        customerName,
        email,
        total: orderTotal,
        estimatedDeliveryDays,
        items: normalizedItems
      }
    });
  } catch (error) {
    console.error('Error creating shop order:', error);
    res.status(500).json({ success: false, message: 'Internal server error while placing the order.' });
  }
});

export default router;
