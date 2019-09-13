const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const hbs = require('hbs');

mongoose.connect('mongodb://localhost:27017/tumblr-lab-development', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'tumblrlabdev',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

passport.serializeUser((user, callback) => {
  callback(null, user.id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then(user => {
      callback(null, user);
    })
    .catch(error => {
      callback(error);
    });
});

passport.use('local-login', new LocalStrategy((username, password, callback) => {
  User.findOne({
    username
  })
    .then(user => {
      if (!user) {
        return callback(null, false, {
          message: "Incorrect username"
        });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return callback(null, false, {
          message: "Incorrect password"
        });
      }
      callback(null, user);
    })
    .catch(error => {
      callback(error);
    });
}));

passport.use('local-signup', new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, callback) => {
  // To avoid race conditions
  process.nextTick(() => {
    User.findOne({
      username
    })
      .then(user => {
        if (user) return callback(null, false);
        // Destructure the body
        const {
          username,
          email,
          password
        } = req.body;
        const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        const newUser = new User({
          username,
          email,
          password: hashPass
        });
        newUser.save()
          .then(user => {
            callback(null, user);
          })
          .catch(error => {
            callback(null, false, error);
          });
      })
      .catch(error => {
        callback(error);
      });
  });
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const index = require('./routes/index');
const authRoutes = require('./routes/authentication');
app.use('/', index);
app.use('/', authRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
