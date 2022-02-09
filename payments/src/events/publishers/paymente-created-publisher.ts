import {
  Publisher,
  PaymentCreatedEvent,
  Subjects,
} from '@ns_micros/tickets-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymenteCreated = Subjects.PaymenteCreated;
}
