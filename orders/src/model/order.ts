import mongoose, { Model } from 'mongoose';
import { OrderStatus } from '@ns_micros/tickets-common';
import { TicketDoc } from './ticket';

export { OrderStatus };
// all possible inputs to create an order
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

// saved document contract - with maybe additional properties added by mongoose
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

// document model - collection form
// this ensures that the input to create an order is validated as well as its output
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// schema => characteristics of every property in the Model
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    // not always there will be an expiration e.g. if the order is fullfilled
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
