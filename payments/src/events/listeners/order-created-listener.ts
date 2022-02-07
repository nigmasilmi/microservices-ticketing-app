import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@ns_micros/tickets-common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  queueGroupName: string = queueGroupName;
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      userId: data.userId,
      price: data.ticket.price,
      status: data.status,
    });
    await order.save();
    msg.ack();
  }
}
