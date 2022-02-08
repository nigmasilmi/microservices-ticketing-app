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

const router = express.Router();

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
    res.send({ success: true });
  }
);

export { router as createChargeRouter };
