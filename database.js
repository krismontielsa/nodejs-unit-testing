exports.database = {
  getUser: (id) => {
    throw new Error('This should not be called in a test!');
  },
};