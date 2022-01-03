import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();

// this is a client, but by convention is called stan
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

// this is a cb function that will be executed once the connection is succesfull
stan.on('connect', async () => {
  console.log('publisher connected to nats');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'Science event',
      price: 30,
      userId: 'czq',
    });
  } catch (err) {
    console.log(err);
  }
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  // stan.publish('ticket:created', data, () => {
  //   // is invoked after the data is published
  //   console.log('event published');
  // });
});
