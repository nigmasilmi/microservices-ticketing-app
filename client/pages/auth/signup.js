import { useState } from 'react';
import axios from 'axios';

const signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorsToShow, setErrorsToShow] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/signup', { email, password });
    } catch (err) {
      setErrorsToShow(err.response.data.errors);
    }
  };
  const renderedErrors = errorsToShow.map((er) => (
    <li key={er.message}>{er.message}</li>
  ));
  return (
    <div className="container">
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
        <ul>{renderedErrors}</ul>
        <button type="submit" className="btn btn-primary">
          Sign up
        </button>
      </form>
    </div>
  );
};

export default signup;
