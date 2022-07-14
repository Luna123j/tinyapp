const { assert } = require('chai');

const callHelpFunctions = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const { getUserByEmail } = callHelpFunctions(testUsers);

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert(user.id, expectedUserID);
  });

  it('should return undefine with invalid email', function() {
    const user = getUserByEmail(testUsers, "user@exle.com");
    const expectedUserID = null;
    assert.deepEqual(user, expectedUserID);
  });
  
});