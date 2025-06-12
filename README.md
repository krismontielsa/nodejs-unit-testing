# Unit Testing on nodejs service

Sinon, Mocha, and Chai for unit testing in a Node.js environment.

## At a Glance: The Dream Team

Think of unit testing like a filming a movie scene. You need a director, a script, and actors.

- **Mocha**: The Director. It sets up the scene, runs the tests in an organized way, and reports back on what happened. It provides the structure for your tests. 
- **Chai**: The Script. It defines what should happen in the scene. You use it to write your expectations and check if the outcome is correct.
- **Sinon**: The Stunt Double. When your code depends on other complex parts (like a database or an external API), Sinon steps in to pretend to be those parts, making your tests simpler and more predictable.

## Sinon: The Art of Faking It
Sinon.js is a library that helps you create "test double." These are like stunt doubles for your code. They stahnd in for the real objects or functions so you can test a poece of your code in isolation. This is crucial for unit testing because you only want to test one thing at a time.

The main types of test doubles in Sinon are: 
- **Spies**: A spy watches a real function. It doesn't change how the function behaves, but it records everything about it: how many times it was called, what arguments were used, etc.
- **Stubs**: A stub is a replacement for a function. You can tell a stub exactly what to do, like return a specific value or throw an error. This is useful for forcing your code down a particular path.
- **Mocks**: Mocks are like stubs but pre-defined expectations. You set up what you expect to happen upfront, and if it doesn't, the test fails.

### Let's starts with a Sinon Stub
Imagine you have function that gets a user from a database. Actually calling the database in a test is slow and unreliable. So, we'll use a Sinon stub to fake the database call.

First, let's set up a project. Open your terminal and run:
```
mkdir unit-testing-demo
cd unit-testing-demo
npm init -y
npm install sinon mocha chai
```

Now, create a file named `user.js`

```javascript
// user.js
const database = {
    getUser: (id) => {
        // In a real app, this would query a database
        throw new Error('This should not be called in a test!');
    }
}

const getUser = (id) => {
    try {
        const user = database.getUser(id);
        return user;
    } catch (error) {
        return null;
    }
}

module.exports = { getUser, database };
```

# Mocha: Structuring Your Tests
Now, let's bring in Mocha. Mocha provides the framework for our tests. Create a `test` folder inside it, a file named `user.test.js`.

Mocha uses `describe()` to group tests and `it()` for individual test cases.

```javascript
// test/user.test.js
import sinon from 'sinon';
import { getUser, database } from '../user.js';

// Mocha uses describe() to group tests and it() for individual test cases.
describe("getUser function", () => {
    it('should return a user object when the database call is success', () => {
        // This is where we'll use Sinon and Chai

    })
});
```

To run this test, open your `package.json` file and add a "test" script:

```json
"scipts": {
    "test": "mocha"
}
```

Now, if you run `run test` in your terminal, Mocha will run the tests. It will pass for now because there's nothing in the `it` block.

# Chai: Asserting Your Expectations
Chai is our assertion library. It lets us check if our code behaved as expected. Chai has a few "style," but `expect` very popular because it reads like natural language.

Let's combine Sinon, and Chai to complete our test. We will "stub" the `database.getUser` method to control its behavior.

Update `test/user.test.js`
```javascript
import sinon from 'sinon';
import { expect } from 'chai';
import { getUser, database } from '../user.js';

describe('getUser function', () => {
    it('should return a user object when the database call is successful', () => {
        // 1. Setup our fake
        const userStub = sinon.stub(database, 'getUser').returns({ id: 1, name: 'John Doe' });

        // 2. Call the function we are testing
        const user = getUser(1);

        // 3. Assert our expectation
        expect(user).to.not.be.null;
        expect(user).to.be.an('object');
        expect(user).to.have.property('name', 'John Doe');
        expect(userStub.calledOnceWith(1)).to.be.true;

        // 4. Clean up the stub
        userStub.restore();

    })

    it('should return null when the database throws error', () => {
        // Setup our fake to throw an error
        const userStub = sinon.stub(database, 'getUser').throws(new Error('Database error'));

        // Call the function
        const user = getUser(1);

        // Assert
        expect(user).to.be.null;
        expect(userStub.calledOnce).to.be.true;

        //Clean up
        userStub.restore();
    })
});
```

## Breaking down the test
1. `sinon.stub(database, 'getUser').returns(...)`: We tell Sinon to replace `database.getUser`. From now on, whenever it's called, it will immediately return the fake user object without ever touching the original (and problematic) function.
2. `getUser()`: We run our function. It thinks it's calling the real database, but it's actually calling our Sinon stub. 
3. `expect(...)`: Here, Chai takes over. We use its readable syntax to check:
- That the user is not `null`.
- That the result is an objct.
- That it has the correct name.
-  We can even use Sinon to ask our stub if it was called once with the argument 1.
4. `userStub.restore()`: This is very important. It removes our stub and restores the original `database.getUser` function. This ensures our tests don't intefere with each other.

Now, when you run `npm test`, you'll see Mocha's output showing that both of your tests have passed! You have successfully unit-tested a function by isolating it from its dependencied.