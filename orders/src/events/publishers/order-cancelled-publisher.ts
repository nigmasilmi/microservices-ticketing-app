import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@ns_micros/tickets-common';

export class OrderCreatedPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
