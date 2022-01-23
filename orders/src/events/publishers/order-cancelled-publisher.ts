import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@ns_micros/tickets-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
