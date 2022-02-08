import { OrderStatus } from '@ns_micros/tickets-common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';

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

// it('returns a 201 with valid inputs', async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();
//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     userId: userId,
//     version: 0,
//     price: 12,
//     status: OrderStatus.Cancelled,
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
// });
