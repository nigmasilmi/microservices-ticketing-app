import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@ns_micros/tickets-common';
import { Order } from '../models/order';
import { stripe } from '../stripe';

const router = express.Router();
// router.post('/api/payments', (req, res) => {
//   res.send('hitted');
// });
router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    //find the order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    // verify the order belongs to the user
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    // verify the order has not been cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Can not pay for a cancelled order');
    }

    // stripe charge stripe.com/docs/api/charge/create
    await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
      description: 'testing implementation',
    });
    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
