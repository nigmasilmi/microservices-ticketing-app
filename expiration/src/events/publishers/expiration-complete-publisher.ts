import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@ns_micros/tickets-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
