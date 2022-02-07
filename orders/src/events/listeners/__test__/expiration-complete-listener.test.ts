import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  OrderStatus,
  ExpirationCompleteEvent,
} from '@ns_micros/tickets-common';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Ticket } from '../../../model/ticket';
import { Order } from '../../../model/order';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // create a ticket
  const ticket = Ticket.build({
    title: 'some title',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  //   create an order with the ticket created
  const order = Order.build({
    userId: 'someId',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // create an event data
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // create message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
