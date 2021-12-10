import 'bootstrap/dist/css/bootstrap.css';

export default ({ Component, pageProps }) => {
  //this custom component is necessary to load global styles
  return <Component {...pageProps} />;
};
