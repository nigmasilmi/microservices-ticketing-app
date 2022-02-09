export const stripe = {
  charges: {
    // returns a promise that resolves itself
    create: jest.fn().mockResolvedValue({}),
  },
};
