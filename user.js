const database = {
    getUser: () => {
        // In a real app, this would query a database
        throw new Error('This should not be called in a test!')
    },
};

const getUser = (id) => {
  try {
    const user = database.getUser(id);
    return user;
  } catch (error) {
    return null;
  }  
};

export { getUser, database };