import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@ns_micros/tickets-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
