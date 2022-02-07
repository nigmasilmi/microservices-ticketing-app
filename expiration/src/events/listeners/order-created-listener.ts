import {
  Listener,
  OrderCancelledEvent,
  OrderCreatedEvent,
  Subjects,
} from '@ns_micros/tickets-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    //
  }
}
