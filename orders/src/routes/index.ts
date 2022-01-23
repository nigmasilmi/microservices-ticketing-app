import express, { Request, Response } from 'express';
import { currentUser, requireAuth } from '@ns_micros/tickets-common';
import { Order } from '../model/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  // all user's order with the ticket in it
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');
  // console.log(orders);
  res.send(orders);
});

export { router as indexOrderRouter };
