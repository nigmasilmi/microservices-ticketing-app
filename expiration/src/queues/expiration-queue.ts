import Queue from 'bull';
interface Payload {
  orderId: string;
}

// 1st argument the name of the "channel", or bucket inside of the Redis server
// 2nd argument options to tell the queue that we want to connect to the Redis instance inside the pod
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// process a job
expirationQueue.process(async (job) => {
  console.log(
    'I want to publish expiration:complete event for orderId',
    job.data.orderId
  );
});

export { expirationQueue };
