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
const sinon = require('sinon');
const { getUser, database } = require('../user.js');

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
const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
const { getUser, database } = require('../user');

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

## Can We 'Stub' The 'database' if It's Private or Not Exported?

The short answer is no: **No, if** `database` **object is truly privare and not exported, you cannot stub it directly using the standard** `sinon.stub(object, 'method')` approach.

Let's break down why and then explore the common solutions to this problem.

Javascript modules in Node.js have their own **scope**. Any variable or function you declare inside a file is private to that file unless you explicitly attach it to `module.exports`. 

Think of your `user.js` file as a sealed box.

```javascript
// user.js -> The "Sealed Box"

// This 'database' object is INSIDE the box
// No one outside can see or touch it.

const database = {
  getUser: (id) => {
      /*... does database stuff ... */
  }
}

const getUser = (id) => {
  try {
    const user = database.getUser(id);
    return user;
  } catch (error) {
    return null
  }
}

module.exports = { getUser };
```

Your test file, `user.test.js`, is outside this box. When it `from '..user.js'`, it only receives the getUser function. It has no reference to, and no knowledge of, the internal `database` constant.

Sinon's `stub(object, 'method')` needs a direct reference to the object it's supposed to modify. Since your test can't access the original `database` object, it can't hand it over to Sinon to be `stubbed`.

### How to Solve This: The Professional Patterns
This is a very common scenario, and it's usually a sign that the code could be more "testable." Here are the two primary ways to handle it.

#### Solution 1: Dependency injection (The Preferred Method)

This is the cleanest and most recommended approach. Instead of a module creating its own dependencies, you "inject" them (pass them in as arguments). This decouples your code and makes it incredibly easy to test.

**1. Refactor Your Code**
Modidy `user.js` to accept the database as a parameter.

```javascript
// user.js (Refactored for Dependency Injection)

// Now our function is pure. It depends only on its inputs.
const createUserActions = (database) => {
    return {
        getUser: (id) => {
            try {
                const user = database.getUser(id);
                return user;
            } catch (error) {
                return null;
            }
        },
        // you could add other user actions here, like deleteUser, etc.
    };
};

module.exports = createUserActions;
```

**2. Update Your Test**

Your test is now much simpler. You can create a completely fake database object ad pass it in. No Sinon needed for this part!

```javascript
// test/user.test.js
const chai = require('chai');
const { expect } = chai;
const createUserActions = require('../user.js');

describe('getUser with Dependency Injection', () => {
    it('should return a user when the database provides one', () => {
        //1. Create a fake database (a simple object literal works
        const fakeDatabase = {
            getUser: (id) => {
                // We control exactly what this fake method does
                expect(id).to.equal(1);
                return { id: 1, name: 'Injected User' };
            }
        } 

        // 2. Inject the fake depency fake dependecy
        const userActions = createUserActions(fakeDatabase);

        // 3. Call the function and assert
        const user = userActions.getUser(1);
        expect(user.name).to.equal('Injected User');
    });
});
```

#### Solution 2: Use a Library like `proxyrequire` (The "Magic" Method)

Sometimes you can't or don't want to refactor the existing code. In these cases, you can use a library like `proxyrequire`. 

`proxyquire` loads your module but allows you to replace its 'require' calls with your own fakes before the module code runs. `proxyquire` is built for CommonJS module system, which uses function `require()` to load modules.

**1. Keep Your Original Code**
Let's assume `user.js` is back to its original, non-injectable form where `database` is reuired internally.

```javascript
// user.js (Original form)
const database = require('./database');

const getUser = (id) => {
    const user = database.getUser(id);
    return user;
}

module.exports = { getUser };
```

**2. Use `proxyquire` in Your Test**

First, `npm install proxyquire`

Now, use it to load your module, replacing the `database` dependency with a Sinon stub.

```javascript
// test/user.test.js
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('getUser with proxyquire', () => {
    it('should return a user by stubbing the internal dependency', () => {
        // 1. Create a Sinon stub for the database's method
        const userStub = sinon.stub().returns({ id: 5, name: "Proxied User"});

        // 2. Load the module using proxyquire
        const { getUser } = proxyquire('../user.js', {
            // Tell proxyquire: "when user.js tries to require('./database')"
            './database' : {
                // ...give it this object instead
                getUser: userStub,
            },
        });

        // 3. Call the function
        const user = getUser(5);

        // 4. Assert that our stub was used and the result is correct
        expect(userStub.calledOnceWith(5)).to.be.true;
        expect(user.name).to.equal('Proxied User');
    })
})
```
#### Solution 3: Use a Library like `rewire' 
Let's say if the 'database' object is a private varibale, 

```javascript
// user.js

// This 'database' object is a private variable, defined right here in the file.
// It is NOT being imported from another file.
const database = {
    getUser: (id) => {
        // In a real app, this would query a database
        throw new Error('This should not be called in a test!');
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

module.exports = { getUser };
```

For this specific structure, `proxyquire` will not work.

The reason is that `proxyquire` is designed to hijack and replace `require()` calls. Its entire purpose is to intercept statements like `const someLibrary = require('some-library');` and provide a fake version of `'some-library`;

In the code above, the `database` object is not loaded via 'require()'. It's a simple constant defined right inside the same file. `proxyquire` has no `require()` statement to intercept, so it can't help here.

The right tool for this job: `rewire`
When you need to modify a private, module-scoped variable that defined within the file itself, you need a different tool called `rewire`.

`rewire` is a bit like a surgical tool. It loads your module and gives you special methods (`__set__ ` and `__get__`) to modify its private internal variables for testing.

Here's how you would test your exact code snipper using `rewire`.

Step 1: Install `rewire`
```bash
npm install rewire
```

**Step 2: Write the Test with `rewire`**

The test will look very similar, but instead of using `proxyquire`, we will use `rewire` to "reach into" `user.js` and replace the `database` constant.

For new code, **always prefer Dependency Injection**. It leads to a healthier and more maintainable codebase. For existing, hard-to-change code, `proxyquire` is an excellent tool to have in your back pocket.