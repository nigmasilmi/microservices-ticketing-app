import request from 'supertest';
import { app } from '../../app';
import mongoose, { Types } from 'mongoose';
import { Order } from '../../model/order';
import { Ticket } from '../../model/ticket';
import { OrderStatus } from '@ns_micros/tickets-common';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/orders ', async () => {
  const response = await request(app).post('/api/orders').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accesed if the user is signed in', async () => {
  //
  await request(app).post('/api/orders').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({ title: 'New ticket', price: 30 });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'randomId',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({ title: 'another ticket', price: 20 });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it.todo('emits an order created event');
