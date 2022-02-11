import React, { useState, useEffect } from 'react';
const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

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
    </div>
  );

  if (timeLeft < 0) {
    timeLeftFeedback = (
      <div>
        <strong>order number</strong> {order.id} <strong> has expired</strong>
      </div>
    );
  }

  return <React.Fragment>{timeLeftFeedback}</React.Fragment>;
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default OrderShow;
