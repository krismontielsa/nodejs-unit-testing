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

    it('should return null when the database throws an error', () => {
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

