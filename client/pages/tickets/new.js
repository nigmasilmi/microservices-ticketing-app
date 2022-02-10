import { useState } from 'react';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const onBlur = (ev) => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };

  return (
    <div>
      <form>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            className="form-control"
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onBlur}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">price</label>
          <input
            className="form-control"
            id="price"
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};
export default NewTicket;
