export const natsWrapper = {
  // define the only property that the publisher cares about
  // look for how the real object is used and mock only the necessary
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
