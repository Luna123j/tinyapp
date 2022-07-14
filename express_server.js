const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
};


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


app.get("/urls", (req, res) => {
  const urlDatabaseByUser = urlsForUser(req.cookies['user_id']);
  const templateVars = { urls: urlDatabaseByUser, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('The shorten url is not exist');
  }
  if (!req.cookies['user_id']) {
    return res.send("please login to check");
  }
  if (urlDatabase[req.params.id]['userID'] !== req.cookies['user_id']) {
    return res.send("can not access the url");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
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
  users[id] = { id: id, email: req.body.email, password: req.body.password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send("Please login to edit url");
  }
  const body = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: body[Object.keys(body)], userID: req.cookies['user_id'] };
  // console.log(urlDatabase);// Log the POST request body to the console
  res.redirect("/urls");
});

app.get("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('The shorten url is not exist');
  }
  if (!req.cookies['user_id']) {
    return res.send("please login to delete");
  }
  if (urlDatabase[req.params.id]['userID'] !== req.cookies['user_id']) {
    return res.send("can not access the url");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('The shorten url is not exist');
  }
  if (!req.cookies['user_id']) {
    return res.send("please login to delete");
  }
  if (urlDatabase[req.params.id]['userID'] !== req.cookies['user_id']) {
    return res.send("can not access the url");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.newURL;
  urlDatabase[req.params.id] = { longURL: newURL, userID: req.cookies['user_id'] };
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.cookies['user_id']) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_login', templateVars);

});

app.post("/login", (req, res) => {

  const user = getUserByEmail(users, req.body.email);
  if (user === null || user.password !== req.body.password) {
    return res.status(404).send('User not exist');
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  // console.log(users)
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

const getUserByEmail = function(userss, email) {
  for (let user in userss) {
    if (userss[user]['email'] === email) {
      return userss[user];
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