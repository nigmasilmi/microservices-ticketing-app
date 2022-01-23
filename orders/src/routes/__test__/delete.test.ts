import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../model/order';
import { Ticket } from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

// the user is authenticated
// the order parameter is valid
// the order exists
// the user is owner of the order
// the order can be created and its status updated

it('can only be accesed if the user is signed in', async () => {
  //
  await request(app).delete('/api/orders/123').send({}).expect(401);
});

it('The orderId must be a valid mongoDB id string', async () => {
  await request(app)
    .delete('/api/orders/123')
    .set('Cookie', global.signin())
    .send()
    .expect(400);
});

it('Marks an order as cancelled', async () => {
  // create a ticket with the Ticket model
  const ticket = Ticket.build({
    title: 'zoo',
    price: 10,
  });

  await ticket.save();

  const user = global.signin();

  // make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  // expectation to make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    title: 'zoo',
    price: 10,
  });

  await ticket.save();

  const user = global.signin();

  // make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
