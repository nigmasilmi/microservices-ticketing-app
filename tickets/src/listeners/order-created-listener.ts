import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@ns_micros/tickets-common';
import { Ticket } from '../models/ticket';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  queueGroupName: string = queueGroupName;

  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw error
    if (!ticket) {
      throw new Error('ticket not found');
    }

    // if found mark the ticket as reserved by setting its orderId property
    ticket.set({ orderId: data.id });
    // save the ticket

    await ticket.save();
    console.log('ticket with the orderId', ticket);
    // ack the message
    msg.ack();
  }
}
