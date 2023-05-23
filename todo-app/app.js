/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

//views accessible globally
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
const saltRounds = 10;

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");

app.use(flash());
app.use(
  session({
    secret: "my_super-secret-key-217263018951768",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  })
);
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(null, false, { message: "Email doesn't exist" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serilaizing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.set("view engine", "ejs");

// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async function (request, response) {
  response.render("index", {
    title: "Todo Application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todo",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const loggedInUser = request.user.id; //here
    const UserName = request.user.firstName;
    const allTodos = await Todo.getTodos();
    const overdue = await Todo.overdue(loggedInUser); //here
    const dueToday = await Todo.dueToday(loggedInUser); //here
    const dueLater = await Todo.dueLater(loggedInUser); //here
    const completedItems = await Todo.completedItems(loggedInUser); //here
    if (request.accepts("html")) {
      response.render("todo", {
        allTodos,
        overdue,
        dueToday,
        dueLater,
        completedItems,
        UserName,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        allTodos,
        overdue,
        dueToday,
        dueLater,
        completedItems,
        UserName,
      });
    }
  }
);

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  //creating the user here
  //hash password using bcrypt
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);

  const fname = request.body.firstName;
  console.log("fir1", fname);
  const sname = request.body.lastName;
  const mail = request.body.email;
  const pwd = request.body.password;
  if (!fname) {
    console.log("fir", fname);
    request.flash("error", "Please enter the first Name");
    return response.redirect("/signup");
  }
  if (!sname) {
    request.flash("error", "please enter the second Name");
    return response.redirect("/signup");
  }
  if (!mail) {
    request.flash("error", "please enter your Email id");
  }
  if (!pwd) {
    request.flash("error", "Please enter valid password");
    return response.redirect("/signup");
  }
  if (pwd < 8) {
    request.flash("error", "Password length should be atleast 8");
    return response.redirect("/signup");
  }

  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        response.redirect("/todo");
      }
    });
  } catch (error) {
    console.log(error);
    request.flash("success", "Sign up successful");
    request.flash("error", error.message);
    return response.redirect("/signup");
  }
});

app.get("/login", async (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todo");
  }
);

app.get("/signout", (request, response, next) => {
  //sign out code is here
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/"); //redirecting to landing page
  });
});

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE
  try {
    const todos = await Todo.findAll();
    return response.send(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("creating a todo", request.body);
    console.log(request.user); //here
    try {
      // eslint-disable-next-line no-unused-vars
      const todo = await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id, //here
      });
      return response.redirect("/todo");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("Deleting a Todo with ID: ", request.params.id);
    try {
      await Todo.remove(request.params.id, request.user.id);
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

module.exports = app;
