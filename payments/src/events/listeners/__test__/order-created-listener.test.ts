import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@ns_micros/tickets-common';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'somId',
    expiresAt: '123456',
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 12,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates a new order as a replica from the original ', async () => {
  const { listener, data, msg } = await setup();

  // trigger the logic on listening (create and save the order)
  await listener.onMessage(data, msg);

  // find the order
  const createdOrder = await Order.findById(data.id);

  expect(createdOrder!.price).toEqual(data.ticket.price);
});

it('acks the msg ', async () => {
  const { listener, data, msg } = await setup();

  // trigger the logic on listening (create and save the order)
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
