import { OrderStatus } from '@ns_micros/tickets-common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// what is needed to create an order
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// the properties that a created object will have
interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}
// because we needed a build method to ensure that the input
// and the output are type validated
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// the actual schema itself
const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, retValue) {
        retValue.id = retValue._id;
        delete retValue._id;
      },
    },
  }
);

// update if current
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    // to pass it into the constructor, we must rename it to _id
    _id: attrs.id,
    version: attrs.version,
    status: attrs.status,
    price: attrs.price,
    userId: attrs.userId,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
