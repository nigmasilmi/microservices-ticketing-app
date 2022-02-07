import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent, OrderStatus } from '@ns_micros/tickets-common';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'someId',
    version: 0,
    price: 16,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'someId',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  // trigger the logic on listening (create and save the order)
  await listener.onMessage(data, msg);

  // find the order
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the msg ', async () => {
  const { listener, data, msg } = await setup();

  // trigger the logic on listening (create and save the order)
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
