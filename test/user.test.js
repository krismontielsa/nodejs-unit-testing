// const sinon = require('sinon');
// const chai = require('chai');
// const { expect } = chai;
// const { getUser, database } = require('../user');

// describe('getUser function', () => {
//     it('should return a user object when the database call is successful', () => {
//         // 1. Setup our fake
//         const userStub = sinon.stub(database, 'getUser').returns({ id: 1, name: 'John Doe' });

//         // 2. Call the function we are testing
//         const user = getUser(1);

//         // 3. Assert our expectation
//         expect(user).to.not.be.null;
//         expect(user).to.be.an('object');
//         expect(user).to.have.property('name', 'John Doe');
//         expect(userStub.calledOnceWith(1)).to.be.true;

//         // 4. Clean up the stub
//         userStub.restore();

//     })

//     it('should return null when the database throws an error', () => {
//         // Setup our fake to throw an error
//         const userStub = sinon.stub(database, 'getUser').throws(new Error('Database error'));

//         // Call the function
//         const user = getUser(1);

//         // Assert
//         expect(user).to.be.null;
//         expect(userStub.calledOnce).to.be.true;

//         //Clean up
//         userStub.restore();
//     })
// });


/* ----------------------------------------------------------------------------------------- */

// // test/user.test.js
// const chai = require('chai');
// const { expect } = chai;
// const createUserActions = require('../user.js');

// describe('getUser with Dependency Injection', () => {
//     it('should return a user when the database provides one', () => {
//         //1. Create a fake database (a simple object literal works
//         const fakeDatabase = {
//             getUser: (id) => {
//                 // We control exactly what this fake method does
//                 expect(id).to.equal(1);
//                 return { id: 1, name: 'Injected User' };
//             }
//         } 

//         // 2. Inject the fake depency fake dependecy
//         const userActions = createUserActions(fakeDatabase);

//         // 3. Call the function and assert
//         const user = userActions.getUser(1);
//         expect(user.name).to.equal('Injected User');
//     });
// });

/* ---------------------------------------------------------------------------------*/

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