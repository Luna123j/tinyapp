const callHelpFunctions = function(urlDatabase) {
  const generateRandomString = function() {
    const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let letter = "";
    for (let i = 0; i < 6; i++) {
      letter += str[getRandomInt(0, 61)];
    }
    return letter;
  };

  const getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  };

  const getUserByEmail = function(users, email) {
    for (let user in users) {
      if (users[user]['email'] === email) {
        return users[user];
      }
    }
    return null;
  };

  const urlsForUser = function(id) {
    const urlDatabaseByUser = {};
    for (let urlID in urlDatabase) {
      if (urlDatabase[urlID]['userID'] === id) {
        urlDatabaseByUser[urlID] = urlDatabase[urlID];
      }
    }
    return urlDatabaseByUser;
  };

  const sortVisitor = function(urlID, visitorInfo) {
    for (let url in visitorInfo) {
      if (urlID === url) {
        return visitorInfo[url];
      }
    }
    return {};
  };

  return { sortVisitor, generateRandomString, getUserByEmail, urlsForUser };
};

module.exports = callHelpFunctions;