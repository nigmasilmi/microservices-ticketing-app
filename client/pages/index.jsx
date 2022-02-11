import React from 'react';
import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  console.log(tickets);
  const signedInStat = currentUser
    ? ' You are signed in'
    : ' You are not signed in, please sign in or register';

  const renderedTickets = tickets.map((tick) => {
    return (
      <tr key={tick.id}>
        <td>{tick.title}</td>
        <td>{tick.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${tick.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <React.Fragment>
      <h3>{signedInStat}</h3>
      <div>
        <h1>Tickets</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>{renderedTickets}</tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

// watch video 224 for explanation about getInitialProps
// getInitialProps is the place where there can be fetching
// of data in the server-side rendering process
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};
export default LandingPage;
