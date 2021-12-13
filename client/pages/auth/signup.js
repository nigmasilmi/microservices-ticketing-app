import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: () => {
      Router.push('/');
    },
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
    setEmail('');
    setPassword('');
  };

  return (
    <div className="container">
      <h3>Sign up</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="emailId">Email</label>
          <input
            type="email"
            className="form-control"
            id="emailId"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="passId">Password</label>
          <input
            type="password"
            className="form-control"
            id="passId"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {/* space for errors */}
        {errors}
        <button type="submit" className="btn btn-primary">
          Sign up
        </button>
      </form>
    </div>
  );
};

export default signup;
