import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@ns_micros/tickets-common';
import { param } from 'express-validator';
import { Order, OrderStatus } from '../model/order';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('A valid order id must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
