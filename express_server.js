const express = require("express");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const methodOverride = require('method-override');
const callHelpFunctions = require('./helpers');
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['userId', 'visitor'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(methodOverride('_method'));

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


app.get("/urls", (req, res) => {
  const urlDatabaseByUser = urlsForUser(req.session.userId);
  const templateVars = { urls: urlDatabaseByUser, user: users[req.session.userId] };
  console.log(urlDatabase);
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session.userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('The shorten url is not exist');
  }
  if (!req.session.userId) {
    return res.send("please login to check");
  }
  if (urlDatabase[req.params.id]['userID'] !== req.session.userId) {
    return res.send("can not access the url");
  }
  const visitor = sortVisitor(req.params.id, visitorInfo);

  const templateVars = { visitorInfo: visitor, visits: urlDatabase[req.params.id]['visits'], id: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], user: users[req.session.userId] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  urlDatabase[req.params.id]['visits']++;
  let visitorID = "";
  if (!req.session.userId) {
    visitorID = generateRandomString();
  } else {
    visitorID = req.session.userId;
  }

  if (!visitorInfo[req.params.id]) {
    visitorInfo[req.params.id] = {};
  }
  visitorInfo[req.params.id][visitorID] = Date();
  const longURL = urlDatabase[req.params.id]['longURL'];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(404).send('Please enter valid email or password');
  }
  if (getUserByEmail(users, req.body.email) !== null) {
    return res.status(404).send('user exist');
  }
  const id = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id: id, email: req.body.email, password: hashedPassword };
  req.session.userId = id;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    return res.send("Please login to edit url");
  }
  const body = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: body[Object.keys(body)], userID: req.session.userId, visits: 0 };
  // console.log(urlDatabase);// Log the POST request body to the console
  res.redirect("/urls");
});



// app.get("/urls/:id/delete", (req, res) => {
//   if (!urlDatabase[req.params.id]) {
//     res.status(404).send('The shorten url is not exist');
//   }
//   if (!req.session.userId) {
//     return res.send("please login to delete");
//   }
//   if (urlDatabase[req.params.id]['userID'] !== req.session.userId) {
//     return res.send("can not access the url");
//   }
//   delete urlDatabase[req.params.id];
//   res.redirect("/urls");
// });

// app.post("/urls/:id/delete", (req, res) => {
//   if (!urlDatabase[req.params.id]) {
//     res.status(404).send('The shorten url is not exist');
//   }
//   if (!req.session.userId) {
//     return res.send("please login to delete");
//   }
//   if (urlDatabase[req.params.id]['userID'] !== req.session.userId) {
//     return res.send("can not access the url");
//   }
//   console.log(urlDatabase[req.params.id]);
//   delete urlDatabase[req.params.id];
//   res.redirect("/urls");
// });

app.delete("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('The shorten url is not exist');
  }
  if (!req.session.userId) {
    return res.send("please login to delete");
  }
  if (urlDatabase[req.params.id]['userID'] !== req.session.userId) {
    return res.send("can not access the url");
  }
  console.log(urlDatabase);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// app.post("/urls/:id", (req, res) => {
//   const newURL = req.body.newURL;
//   urlDatabase[req.params.id] = { longURL: newURL, userID: req.session.userId };
//   res.redirect("/urls");
// });

app.put("/urls/:id", (req, res) => {
  const newURL = req.body.newURL;
  urlDatabase[req.params.id] = { longURL: newURL, userID: req.session.userId };
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('urls_login', templateVars);

});

app.post("/login", (req, res) => {

  const user = getUserByEmail(users, req.body.email);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (user === null || bcrypt.compareSync(user.password, hashedPassword)) {
    return res.status(404).send('User not exist');
  }
  req.session.userId = user.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  // console.log(users)
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

