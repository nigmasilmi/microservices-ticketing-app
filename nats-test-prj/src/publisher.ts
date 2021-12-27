import nats from 'node-nats-streaming';
console.clear();

// this is a client, but by convention is called stan
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

// this is a cb function that will be executed once the connection is succesfull
stan.on('connect', () => {
  console.log('publisher connected to nats');
  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20,
  });

  stan.publish('ticket:created', data, () => {
    // is invoked after the data is published
    console.log('event published');
  });
});
