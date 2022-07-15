////////////////////////////
////    requirement     ////
////////////////////////////

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const methodOverride = require('method-override');
const callHelpFunctions = require('./helpers');
const app = express();
const PORT = 8080;

////////////////////////////
////    middleware      ////
////////////////////////////

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['userId', 'visitor'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(methodOverride('_method'));

////////////////////////////
////    constants       ////
////////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visits: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visits: 3
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('123', 10),
  },
};

const visitorInfo = {
  url: {
    visitorID: Date
  }
};

const { sortVisitor, generateRandomString, getUserByEmail, urlsForUser }
  = callHelpFunctions(urlDatabase);


////////////////////////////
////    Route           ////
////////////////////////////

app.get("/urls", (req, res) => {
  const userIdInCookie = req.session.userId;
  const urlDatabaseByUser = urlsForUser(userIdInCookie); // return users for specific urlID
  const templateVars = { urls: urlDatabaseByUser, user: users[userIdInCookie] };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userIdInCookie = req.session.userId;

  // if user not login redirect to login page
  if (!userIdInCookie) {
    return res.redirect("/login");
  }

  //otherwise shows create new url page
  const templateVars = { user: users[userIdInCookie] };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const userIdInCookie = req.session.userId;

  //error case:
  //if shorten url not exist
  if (!urlDatabase[urlID]) {
    return res.status(404).send('The shorten url is not exist');
  }
  //if user does not login
  if (!userIdInCookie) {
    return res.send("please login to check");
  }
  //if the shorten url does not belong to current user
  if (urlDatabase[urlID]['userID'] !== userIdInCookie) {
    return res.send("can not access the url");
  }

  const visitor = sortVisitor(urlID, visitorInfo); //grab visitor info in order to show visit history of this shorten url
  const templateVars = { visitorInfo: visitor, visits: urlDatabase[urlID]['visits'], id: urlID, longURL: urlDatabase[urlID]['longURL'], user: users[userIdInCookie] };
  
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  const userIdInCookie = req.session.userId;

  //error if shorten url not exist
  if (!urlDatabase[urlID]) {
    return res.status(404).send('The shorten url is not exist');
  }

  urlDatabase[urlID]['visits']++;
  let visitorID = "";

  if (!userIdInCookie) {
    visitorID = generateRandomString();
  } else {
    visitorID = userIdInCookie;
  }

  //initialize new visitor's information obj
  if (!visitorInfo[urlID]) {
    visitorInfo[urlID] = {};
  }
  //if not a new visitor overwrite this visitor's timestamp
  visitorInfo[urlID][visitorID] = Date();

  const longURL = urlDatabase[urlID]['longURL'];
  res.redirect(longURL);
});


app.get("/register", (req, res) => {

  //if user already login redirect to main url page
  if (req.session.userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.userId],
  };

  res.render('urls_register', templateVars);
});


//form from urls_register.ejs (register page inputs -> email and password)
app.post("/register", (req, res) => {

  //return error if empty password or username or invilid email
  if (!req.body.email || !req.body.password) {
    return res.status(404).send('Please enter valid email or password');
  }
  if (getUserByEmail(users, req.body.email) !== null) {
    return res.status(404).send('user exist');
  }

  const id = generateRandomString();//generate random user id
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = { id: id, email: req.body.email, password: hashedPassword };
  req.session.userId = id;
  res.redirect('/urls');
});


//form from urls_new.ejs (edit url in edit page)
app.post("/urls", (req, res) => {

  if (!req.session.userId) {
    return res.send("Please login to edit url");
  }

  const body = req.body;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL: body[Object.keys(body)], userID: req.session.userId, visits: 0 };
  res.redirect("/urls");
});


//form from urls_index.ejs (delete button)
app.delete("/urls/:id", (req, res) => {

  //error cases
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('The shorten url is not exist');
  }
  if (!req.session.userId) {
    return res.send("please login to delete");
  }
  if (urlDatabase[req.params.id]['userID'] !== req.session.userId) {
    return res.send("can not access the url");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//form from urls_show.ejs (edit page)
app.put("/urls/:id", (req, res) => {

  const newURL = req.body.newURL;

  urlDatabase[req.params.id] = { longURL: newURL, userID: req.session.userId };
  res.redirect("/urls");
});


app.get("/login", (req, res) => {

  //if user logged in, show main page
  if (req.session.userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user: users[req.session.userId] };

  res.render('urls_login', templateVars);

});


//form from urls_login.ejs
app.post("/login", (req, res) => {

  const user = getUserByEmail(users, req.body.email);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //if email does not exist or wrong password return error
  if (user === null || bcrypt.compareSync(user.password, hashedPassword)) {
    return res.status(404).send('User not exist');
  }

  req.session.userId = user.id;
  res.redirect("/urls");

});

//form from urls_index.ejs (logout button)
app.post("/logout", (req, res) => {
  req.session = null; //clear all cookies
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
