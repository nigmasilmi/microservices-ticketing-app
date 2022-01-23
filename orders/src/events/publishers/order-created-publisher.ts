import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@ns_micros/tickets-common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
