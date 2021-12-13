import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  const signedInStatement = ' You are signed in';
  const notSignedInStatement =
    ' You are not signed in, please sign in or register';
  return currentUser ? (
    <h1>{signedInStatement}</h1>
  ) : (
    <h1>{notSignedInStatement}</h1>
  );
};

// watch video 224 for explanation about getInitialProps
// getInitialProps is the place where there can be fetching
// of data in the server-side rendering process
LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};
export default LandingPage;
