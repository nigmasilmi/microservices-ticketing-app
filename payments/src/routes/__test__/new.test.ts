import { OrderStatus } from '@ns_micros/tickets-common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('returns a 404 when purchasing an order that does not exist', async () => {
  //
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'lkjsdl',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  // create and save order

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 12.99,
    status: OrderStatus.Created,
  });

  await order.save();
  // request to pay for the order with another user
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'lkjsdl',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing an order that has been cancelled', async () => {
  // create an order with specific user and status cancelled
  const userID = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userID,
    version: 0,
    price: 12,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  // try to purchase that order
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userID))
    .send({ orderId: order.id, token: 'lkjlkj' })
    .expect(400);
});
// Uncomment when solving the env var approach
// it('returns a 201  with valid inputs, and creates a payment record', async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();
//   // generate a random price to be able to identtify the charge among
//   // the most recent charges
//   const price = Math.floor(Math.random() * 100000);
//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     userId: userId,
//     version: 0,
//     price,
//     status: OrderStatus.Created,
//   });
//   await order.save();

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signin(userId))
//     .send({
//       token: 'tok_visa',
//       orderId: order.id,
//     })
//     .expect(201);

//   // get the 10 most recent
//   const { data: charges } = await stripe.charges.list({ limit: 50 });

//   const stripeCharge = charges.find((chr) => chr.amount === price * 100);

//   expect(stripeCharge).toBeDefined();
//   expect(stripeCharge!.currency).toEqual('usd');

//   const payment = await Payment.findOne({
//     orderId: order.id,
//     stripeId: stripeCharge!.id,
//   });

//   expect(payment).not.toBeNull();
//   // // with mock
//   // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   // expect(chargeOptions.source).toEqual('tok_visa');
//   // expect(chargeOptions.amount).toEqual(12 * 100);
//   // expect(chargeOptions.currency).toEqual('usd');
// });
