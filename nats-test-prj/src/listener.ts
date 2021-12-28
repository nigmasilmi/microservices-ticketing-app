import nats from 'node-nats-streaming';
import { TicketCreatedListener } from './events/ticket-created-listener';
import { randomBytes } from 'crypto';

console.clear();
const clientId = randomBytes(4).toString('hex');
const stan = nats.connect('ticketing', clientId, {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to nats');
  stan.on('close', () => {
    console.log('nats connection closed');
    process.exit();
  });
  new TicketCreatedListener(stan).listen();
});
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
