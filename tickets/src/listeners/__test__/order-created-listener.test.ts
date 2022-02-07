import { natsWrapper } from '../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent } from '@ns_micros/tickets-common';
import { OrderStatus } from '@ns_micros/tickets-common';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'rock concert',
    price: 23.99,
    userId: 'someId',
  });

  await ticket.save();

  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'someId',
    expiresAt: '123',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  // return everything
  return { listener, ticket, data, msg };
};

it('adds the orderId property to the ticket', async () => {
  // set up
  const { listener, ticket, data, msg } = await setup();

  // add the ticket id to the order with onMessage
  await listener.onMessage(data, msg);

  // fetch the ticket and expect to have the same order id
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  // set up
  const { listener, ticket, data, msg } = await setup();

  // add the ticket id to the order with onMessage
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated ticket event when listening to an order created event', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  // @ts-ignore
  // console.log(natsWrapper.client.publish.mock.calls);
  // @ts-ignore
  // console.log(natsWrapper.client.publish.mock.calls[0][1]);
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
