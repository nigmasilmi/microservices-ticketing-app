import { Message } from 'node-nats-streaming';
import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@ns_micros/tickets-common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../model/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymenteCreated = Subjects.PaymenteCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    //find the order
    const order = await Order.findById(data.orderId);
    // update its status
    if (!order) {
      throw new NotFoundError();
    }
    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
