import React, { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/useRequest';
import { publishableKey } from '../../publishableKey';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => console.log(payment),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [order]);

  let timeLeftFeedback = (
    <div>
      {timeLeft} seconds until the order expires, <br />
      <strong>please complete the purchase before the time expires</strong>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={publishableKey}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );

  if (timeLeft < 0) {
    timeLeftFeedback = (
      <div>
        <strong>order number</strong> {order.id} <strong> has expired</strong>
      </div>
    );
  }

  return (
    <React.Fragment>
      {timeLeftFeedback}
      {errors}
    </React.Fragment>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default OrderShow;
