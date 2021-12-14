import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const createTicket = () => {
  const title = 'A new event';
  const price = 23;
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  const response = await request(app).get('/api/tickets').send().expect(200);
  expect(response.body.length).toEqual(2);
});
