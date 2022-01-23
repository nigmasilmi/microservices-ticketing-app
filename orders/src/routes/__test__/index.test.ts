import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../model/order';
import { Ticket } from '../../model/ticket';

// helper to create the tickets
const buildTicket = async () => {
  const ticket = Ticket.build({ title: 'zoo', price: 5 });
  await ticket.save();
  return ticket;
};
it('fetches orders for a particular user', async () => {
  // Create 3 tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();
  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order as user one
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create two orders as user two
  // destructuring and renaming in one step body: orderOne
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Fetch orders to get orders for user two

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  //   console.log('response', response.body);

  // expectation to have the two orders belonging to user two
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);
});
