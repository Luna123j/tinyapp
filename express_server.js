const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(404).send('Please enter valid email or password');
  }
  if (getUserByEmail(users,req.body.email) !== null) {
    return res.status(404).send('user exist');
  }
  const id = generateRandomString();
  users[id] = { id: id, email: req.body.email, password: req.body.password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const body = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = body[Object.keys(body)];
  console.log(urlDatabase);// Log the POST request body to the console
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const body = req.body;
  const newURL = body[Object.keys[body]];
  urlDatabase[req.params.id] = newURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  
  const user = getUserByEmail(users,req.body.email);
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