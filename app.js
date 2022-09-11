// most of the password reset code borrowed from http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
//
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const ejsLint = require('ejs-lint');
const http = require('http'); // not sure if i am using this
const fs = require('fs');  // needed to upload documents
const cookieParser = require('cookie-parser'); // to store and use cookies
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose'); // interacts with MongoDB
const nodemailer = require('nodemailer'); // for sending emails
const passport = require('passport'); // user authentication
const flash = require('connect-flash'); // flash: to store messages in session
const morgan = require('morgan'); // morgan: to log every request
const async = require('async'); // to avoid dealing with nested callbacks
const crypto = require('crypto'); // generate random token for email/password reset
const app = express();

// middleware
app.set('view engine', 'ejs');
//app.set('views', './views');
//app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
// session is used by passport
app.use(session({
    secret: 'my-super-secrete-code!@#$_-++',
    resave: false,
    saveUninitialized: false, 
    maxAge: 60*60*1000  // expire in 1 hour if inactive
   })
);
app.use(flash()); // to use flash messages stored in session
app.use(passport.initialize()); //must be set after session
app.use(passport.session()); // for persistent login sessions; must be set after session
app.use(express.static(path.join(__dirname,'public'))); //to store and access images and public functions


// required databases
require('./model/database');
require('./config/passport');
//require('./codebase/dhtmlxscheduler');

const Schedule = require('./model/Schedule');
const User = require('./model/user');
const Student = require('./model/student');


// routing setup
app.get('/', (req, res) => {
  const message = req.flash('success');  
  const messageerror = req.flash('signuperror');
  const messagesuccess = req.flash('signupsuccess');
  Schedule.find({meeting_status: "open", start_date: {$gte: Date.now()}}).sort('start_date').exec(function(err, results) {
    if (err) {
      return res.send('<h1>Error</h1>');
    }
    res.render('advisementHome', {user: req.user, req: req, message, messageerror, messagesuccess, results});
  });
});

// Must validate email before signup
app.get('/emailValidation', (req, res) => {
  res.render('emailValidation', {req, message: req.flash('info')});
});

app.post('/emailValidation',(req, res, next) => {
// using waterfall to prevent nested callbacks
  async.waterfall([       
      (done) => {
        crypto.randomBytes(20, (err, buf) => {  // create token
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done) => {  //send user an email with the link to reset password
        const smtpTransport = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'justina.kulas@ethereal.email',
            pass: 'rzN1k56hV7qKNsuEWa'
          }
        });
        const email = req.body.email;
        const mailOptions = {
          to: req.body.email,
          from: 'newaccounts@demo.com',
          subject: 'UCO Advisement Email Validation',
          text: 'You are receiving this because you have requested to create an advisement account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/signup/' + token + '/' +  email + '\n\n' +
            'If you did not request this, please ignore this email; no account will be created.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          done(err, 'done');
        });

        console.log("Message sent: %s", mailOptions.text);

      }
    ], (err) => {
    if (err) {
      req.flash('info', 'An error occurred in validation');
      return next(err);
    }
  });
  req.flash('info', 'An e-mail has been sent to the address provided with further instructions.');
  res.redirect('/emailValidation');
});

// Sign up to register email and password
app.get('/signup/:token/:email', (req, res) => {  
  const messageerror = req.flash('signuperror');
  const messagesuccess = req.flash('signupsuccess');
  const email = req.params.email;
  const token = req.params.token;
  res.render('signup', {req, email, token, messageerror, messagesuccess});
});

app.post('/signup/:token/:email', passport.authenticate('localsignup', {
  successRedirect: '/',
  failureRedirect: '/signup/:token/:email',
  successFlash: true,
  failureFlash: true
}));

// faculty login. NOTE: the user role for faculty advisor must manually be changed from 'student' to 'admin'
// in order to access the faculty advisement page
app.get('/facultyLogin', (req, res) => {
  const messagesuccess = req.flash('temp', '');
  const messageerror = req.flash('loginerror');
  res.render('facultyLogin', {req: req, user: req.user, messagesuccess, messageerror});
});

app.post('/facultyLogin', passport.authenticate('facultylogin', {
  successRedirect: '/facultyAdvHome',
  failureRedirect: '/facultyLogin',
  successFlash: false,
  failureFlash: true
}));

app.get('/allStudents', isLoggedIn, (req, res) => {
  const messagesuccess = req.flash('temp', '');
  const messageerror = req.flash('loginerror');
  Student.find().sort({lastname: 1}).exec((err, results) => {
    if (err) {
      return res.send('<h1>Error</h1>');
    }
    res.render('allStudents', {req: req, user: req.user, messagesuccess, messageerror, results, Student});
  });
});

app.get('/meetings', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  Schedule.find({meeting_status: "closed"}).sort('-start_date').exec(function(err, results) {
    if (err) {
      return res.send('<h1>Error</h1>');
    }
    Student.find({}, (err, students)=>{
      if (err) {
        return res.send('<h1>Error</h1>');
      }
      res.render('meetings', {user: req.user, req: req, message, results, students});
    })
  });
});

app.get('/multipleevents', isLoggedIn, (req,res) => {
  const messagesuccess = req.flash('temp', '');
  const messageerror = req.flash('loginerror');
  res.render('multipleevents', {req: req, user: req.user, messagesuccess, messageerror});
});

app.post('/addEvent', (req, res) => {
  var start  = req.body.start_time;
  const end = req.body.end_time;
  const date = req.body.date;

  var diff = 0;
  if (start != "" && end != "") {
      var tstart = parseTime(start);
      var tend = parseTime(end);
      diff = (tend - tstart)/(1000*60);
  }
  else {
      diff = "";
  }
  const count = diff/10;
  for (var i = 0; i < count; i++){
    const schedule = new Schedule();
    schedule.meeting_status = "open";
    schedule.text = req.body.text;
    schedule.date = Date.parse(req.body.date);
    schedule.start_time = start;
    schedule.start_date = Date.parse(date +" " + start);
    start = addMinutes(start, 10);
    schedule.end_time = start;
    schedule.end_date = Date.parse(date + " " + start);
    schedule.save();
  }
  res.redirect('/scheduler');
});

app.get('/studentInfo', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  var id;
  if (req.body.student) id = student.id;
  else id = req.query.id;
  User.findOne({'student': id}, (err, stuuser) => {
    if (err) {
      req.flash('info', "Can't locate user.");
      return res.redirect('/studentInfo')
    };
    Student.findOne({'_id': id}, (err, student) => {
      if (err) {
        req.flash('info', "Can't locate student.");
        return res.redirect('/studentInfo')
      }
      Schedule.find({'student': id}, (err, results) =>{
        if (err) {
          req.flash('info', "Can't locate schedule.");
          return res.redirect('/studentInfo')
        }
        res.render('studentInfo', {req: req, user: req.user, student, stuuser, results, message});
      });
    });
  });
});

app.get('/addNote', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  User.findOne({'student': req.query.id}, (err, stuuser) => {
    if (err) {return res.send('<h1>Error</h1>');}
    Student.findOne({'_id': req.query.id}, (err, student) => {
      if (err) {
        return res.send('<h1>Error</h1>');
      }
      res.render('addNote', {req: req, user: req.user, student, stuuser, message});
    });
  }
)});

//
app.post('/addNote', (req, res) => {
  const message = req.flash('info');
  const mydate = Date.now();
  const note = {
    date: mydate,
    text: req.body.text
  };
  Schedule.find({student: req.body.id}, (err, results) => {
    if (err) {
      req.flash('info', 'An error has occured in the schedules database.');
      return res.redirect('/');
    }
    User.findOne({'student': req.body.id}, (err, stuuser) => {
      if (err) {return res.send('<h1>Error</h1>');}
      Student.findByIdAndUpdate(req.body.id,
        {$push: {notes: note}},
        {safe: true, upsert: true},
        function(err, student) {
          if (err) {
            return res.send('<h1>Error</h1>');
          }
          else {
            res.render('studentInfo', {req: req, user: req.user, student, stuuser, results, message});
          }
        }
      )
    });
  });
});

app.get('/advHistory', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  Schedule.findById(req.query.scheduleid, (err, schedule) => {
    if (err) {
      req.flash('info', "Can't find schedule");
      return res.redirect('/studentInfo');
    }
    Student.findById(req.query.studentid, (err, student) => {
      if (err) {
        req.flash('info', "Can't find student"); 
        return res.redirect('/studentInfo');
      }
      res.render('advHistory', {req, user: req.user, student, schedule, message});
    });
  });
});

app.post('/saveStatus', isLoggedIn, (req,res) => {
  const message = req.flash('info');
  Schedule.findById(req.body.scheduleid, (err, schedule) => {
    if (err) {
      req.flash('info', 'An error has occured in the schedules database.');
      return res.redirect('/');
    }
    Student.findById(req.body.studentid, (err, student) => {
      if (err) {
        req.flash('info', "Can't find student"); 
        return res.redirect('/studentInfo');
      }
      schedule.adv_status = req.body.statusRadio;
      schedule.save();
      if (req.body.statusRadio =="Complete") student.advstatus = "Complete";
      else if ((req.body.statusRadio == "Canceled") || req.body.statusRadio == "No Show") student.advstatus = "";
      else if (req.body.statusRadio == "Scheduled") student.advstatus = "Scheduled";
      student.save();
      res.render('advHistory', {req, user: req.user, student, schedule, message});
    });
  });
})


app.post('/edit', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  User.findOne({'student': req.body.id}, (err, stuuser) => {
      if (err) {return res.send('<h1>Error</h1>');}
    Student.findOne({'_id': req.body.id}, (err, student) => {
      if (err) res.render('editStudentInfo', {req, user: req.user, message});
      if (!student) res.render('editStudentInfo', {req, user: req.user, message});
      res.render('editStudentInfo', {req, user: req.user, student, stuuser, message});
    });
  });
});


app.post('/editStudentInfo', (req, res, next)=> {
  const message = req.flash('info');
  Schedule.find({student: req.body.id}, (err, results) => {
    if (err) {
      req.flash('info', 'An error has occured in the schedules database.');
      return res.redirect('/');
    }
    User.findOne({'student': req.body.id}, (err, stuuser) => {
      if (err) {return res.send('<h1>Error</h1>');}
      Student.findOne({'_id': req.body.id}, (err, student) => {
        if (err) return err;
        if (!student) return next();      
        stuuser.email = req.body.email;
        student.ucoid = req.body.ucoid;
        student.firstname = req.body.firstname;
        student.lastname = req.body.lastname;
        student.phone = req.body.phone;
        student.major = req.body.major;
        student.updated = Date.now();
        req.user.student = student._id;
        student.save();
        stuuser.save();  
        res.render('studentInfo', {req, user: req.user, student, stuuser, results, message});
      });
    });
  });
});

app.get('/remove', (req, res, next) => {
  Student.remove({_id: req.query.id}, (err, results) => {  
		if (err) {
			return res.send('<h1>Remove error</h1>');
    }
  });
  User.remove({student: req.query.id}, (err, results) => {
    if (err) {
      return res.send('<h1>Remove error</h1>');
    }
    return res.redirect('/facultyAdvHome');
	});
})


// student login 
app.get('/login', (req, res) => {
  const messagesuccess = req.flash('temp', '');
  const messageerror = req.flash('loginerror');
  res.render('login', {req, user: req.user, messagesuccess, messageerror});
});

// register the user at session on successful login
// then, use auth middleware for user protected page access
app.post('/login', passport.authenticate('locallogin', {
  successRedirect: '/studentAccount',
  failureRedirect: '/login',
  successFlash: false,
  failureFlash: true
}));

// isLoggedIn middleware verifies if already logged in
app.get('/facultyAdvHome', isLoggedIn, (req, res) => {
    // get user stored in session object and pass it
    res.render('facultyAdvHome', {req: req, user: req.user});
})

app.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Forgot password GET
app.get('/forgot', (req, res) => {
  const messagesuccess = req.flash('success');
  const messageerror = req.flash('error');
  res.render('forgot', {req: req, user: req.user, messagesuccess, messageerror});
});

// Forgot password POST
app.post('/forgot', (req, res, next) => {
    // using waterfall to prevent nested callbacks
    async.waterfall([       
      (done) => {
        crypto.randomBytes(20, (err, buf) => {  // create token
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;  // store token
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save((err) => {
            done(err, token, user);
          });
        });
      },
      (token, user, done) => {  //send user an email with the link to reset password
        const smtpTransport = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'qnio4hoykjoytuu5@ethereal.email',
            pass: 'w35Gn5wGB6XcMCZy42'
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'UCO Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], (err) => {
      if (err) {
        req.flash('error', 'An error occurred');
        return next(err);
      }
      res.redirect('/forgot');
    });
});

// reset password -- follows 'forgot' 
app.get('/reset/:token', (req, res)=> {
  const messagesuccess = req.flash('success');
  const messageerror = req.flash('error');
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user)=> {
        if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
        }
        res.render('reset', {req, user: req.user, messagesuccess, messageerror});
    });
});

app.post('/reset/:token', function(req, res) {
  // using waterfall to prevent nested callbacks
    async.waterfall([
      (done) => {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, (err, user) => {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
          }

          //user.password = req.body.password;      
          user.resetPasswordToken = undefined;    // remove password token
          user.resetPasswordExpires = undefined;  // remove expiration

          password = req.body.password;
          user.encryptPassword(password, (err, result) => {
            if (err) return callback(null, false, req.flash('error', err)); 
            user.password = result;  // store new password
            user.save();
          });
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      (user, done) => { //send user an email confirmation that password has been reset
        const smtpTransport = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: 'qnio4hoykjoytuu5@ethereal.email',
              pass: 'w35Gn5wGB6XcMCZy42'
            }
        });
        const mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' + 
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, (err)=> {
          req.flash('success', 'Success! Your password has been changed.');
          done(err, 'done');
        });
      }
    ], 
    (err)=> {
      if (err) {
        req.flash('error', 'An error occurred');
        return next(err);
      }
      res.redirect('/');
    });
});

// isLoggedIn middleware verifies if already logged in
app.get('/studentAccount', isLoggedIn, (req, res) => {
    // get user stored in session object and pass it
    const message = req.flash('info');
    if(req.user.student) {
      Student.findOne({'_id': req.user.student}, (err, student) => {
        if (err) return res.redirect('/');
        if (!student) return res.redirect('/');
        Schedule.find({student: student._id}, (err, results) => {
          if (err) {
            req.flash('info', "Can't locate schedule.");
            return res.redirect('/');
          } 
          res.render('studentAccount', {req, user: req.user, student, results, message});
        })
        
      });
    }
    else res.render('studentAccount', {req, user: req.user, message});
});

app.get('/editStudentAccount', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  if(req.user.student) {
    Student.findOne({'_id': req.user.student}, (err, student) => {
      if (err) res.render('editStudentAccount', {req, user: req.user, message});
      if (!student) res.render('editStudentAccount', {req, user: req.user, message});
      res.render('editStudentAccount', {req, user: req.user, student, message});
    });
  }
  else res.render('editStudentAccount', {req, user: req.user, message});
});

app.post('/editStudentAccount', (req, res, next)=> {
  const message = req.flash('info');
  if (!req.user.student){
    const student = new Student();
    student.ucoid = req.body.ucoid;
    student.firstname = req.body.firstname;
    student.lastname = req.body.lastname;
    student.phone = req.body.phone;
    student.major = req.body.major;
    req.user.student = student._id;
    student.save();
    req.user.save();  
  }
  else {
    Student.findOne({'_id': req.user.student}, (err, student) => {
      if (err) return err;
      if (!student) return next();
      student.ucoid = req.body.ucoid;
      student.firstname = req.body.firstname;
      student.lastname = req.body.lastname;
      student.phone = req.body.phone;
      student.major = req.body.major;
      student.updated = Date.now();
      req.user.student = student._id;
      student.save();
      req.user.save();  
    }); 
  }
  res.redirect('/studentAccount');
});

app.get('/advschedule', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  Schedule.find({meeting_status: "open", start_date: {$gte: Date.now()} }).sort({start_date: 1}).exec((err, results) => {
    if (err) {
      req.flash('info', 'An error has occured in the schedules database.');
      return res.redirect('/');
    }
    Student.findById(req.user.student, (err, student) => {
      if (err) {
        req.flash('info', 'An error has occurred in the students database.'); 
        return res.redirect('/');
      }
      if (!student) {
        req.flash('info', 'Unable to find student in students database.');
        return res.redirect('/');
      }
      res.render('advschedule', {user: req.user, req, student, message, results});
    });
  });
});

app.post('/advSignup', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  Schedule.findById(req.body.scheduleid, (err, schedule) => {
    if (err) {
      req.flash('info', 'An error has occured in the schedules database.');
      return res.redirect('/');
    }
    Student.findById(req.body.studentid, (err, student) => {
      if (err) {
        req.flash('info', 'An error has occurred in the students database.'); 
        return res.redirect('/');
      }
      res.render('advSignup', {req, user: req.user, student, schedule, message});
    });
  });
});

app.post('/advCompleteSignup', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  const class1 = {
    semester: req.body.S1,
    prefix: req.body.P1,
    course_number: req.body.N1,
    crn: req.body.CRN1,
    title: req.body.T1
  };

  const class2 = {
    semester: req.body.S2,
    prefix: req.body.P2,
    course_number: req.body.N2,
    crn: req.body.CRN2,
    title: req.body.T2
  };
  const class3 = {
    semester: req.body.S3,
    prefix: req.body.P3,
    course_number: req.body.N3,
    crn: req.body.CRN3,
    title: req.body.T3
  };
  const class4 = {
    semester: req.body.S4,
    prefix: req.body.P4,
    course_number: req.body.N4,
    crn: req.body.CRN4,
    title: req.body.T4
  };
  const class5 = {
    semester: req.body.S5,
    prefix: req.body.P5,
    course_number: req.body.N5,
    crn: req.body.CRN5,
    title: req.body.T5
  };
  const class6 = {
    semester: req.body.S6,
    prefix: req.body.P6,
    course_number: req.body.N6,
    crn: req.body.CRN6,
    title: req.body.T6
  };
  const class7 = {
    semester: req.body.S7,
    prefix: req.body.P7,
    course_number: req.body.N7,
    crn: req.body.CRN7,
    title: req.body.T7
  };
  const class8 = {
    semester: req.body.S8,
    prefix: req.body.P8,
    course_number: req.body.N8,
    crn: req.body.CRN8,
    title: req.body.T8
  };

  // Push schedule information into the proposed_schedule array
  if (class8.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class8}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  if (class7.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class7}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  if (class6.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class6}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  if (class5.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class5}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  if (class4.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class4}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  if (class3.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class3}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  if (class2.semester.length > 0){
    Schedule.findByIdAndUpdate(req.body.scheduleid, 
      {$push: {proposed_schedule: class2}},
      {safe: true, upsert: true}, (err, schedule) => {
      if (err) {
        req.flash('info', 'An error has occured in updating your class schedule.');
        return res.redirect('/studentAccount');
      }
    });
  }
  Schedule.findByIdAndUpdate(req.body.scheduleid, 
    {$push: {proposed_schedule: class1}},
    {safe: true, upsert: true}, (err, schedule) => {  
    if (err) {
      req.flash('info', 'An error has occured in updating your class schedule.');
      return res.redirect('/studentAccount');
    }
  });

  Student.findByIdAndUpdate(req.body.studentid, 
    {$push: {advisementhistory: req.body.scheduleid}},
    {safe: true, upsert: true}, (err, schedule) => {
    if (err) {
      req.flash('info', 'An error has occured in updating your advisement history.');
      return res.redirect('/studentAccount');
    }
  });

  Schedule.findById(req.body.scheduleid, (err, schedule) => {
    if (err) {
      req.flash('info', 'An error has occured in the schedules database.');
      return res.redirect('/studentAccount');
    }
    Student.findById(req.body.studentid, (err, student) => {
      if (err) {
        req.flash('info', 'An error has occurred in the students database.'); 
        return res.redirect('/studentAccount');
      }
      schedule.student = req.body.studentid;
      schedule.meeting_status = "closed";
      schedule.degree_plan = req.body.majorRadio;
      schedule.meeting_type = req.body.skypeRadio;
      schedule.skype_id = req.body.skypeID;
      schedule.questions = req.body.question;
      schedule.adv_status = "Scheduled";
      student.advstatus = "Scheduled";
      schedule.save();
      student.save();
      req.flash('info', "You have successfully signed up for your advisement meeting.");
      res.redirect('/studentAccount');
    });
  });
})

app.get('/myCurrentAdv', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  Schedule.findById(req.query.scheduleid, (err, schedule) => {
    if (err) {
      req.flash('info', "Can't find schedule");
      return res.redirect('/studentAccount');
    }
    Student.findById(req.query.studentid, (err, student) => {
      if (err) {
        req.flash('info', "Can't find student"); 
        return res.redirect('/studentAccount');
      }
      res.render('myCurrentAdv', {req, user: req.user, student, schedule, message});
    });
  });
});



app.get('/scheduler', isLoggedIn, (req, res) => {
  const message = req.flash('info');
  res.render('scheduler', {req, user: req.user, message})
});


app.get('/data', function(req, res){
  Schedule.find({}, (err, results) => {
		if (err) {
			return res.send('<h1>Error</h1>');
    }
    return res.send(JSON.stringify(results));
	});
});


app.post('/data', function(req, res){
  var data = req.body;
  var sid = data.ids;
  var tid = sid;
  
  const mode = sid + "_" + "!nativeeditor_status";
  const text = sid + "_" + "text";
  const start_date = sid + "_" + "start_date";
  const end_date = sid + "_" + "end_date";
  const details = sid + "_" + "details";

  delete data.ids;
  delete data.gr_id;
  delete data["!nativeeditor_status"];

  if (data[mode] == "updated")
    Schedule.findById( sid, function(err, schedule) {
      if (err) return handleError(err);
      schedule.text = data[text];
      schedule.date = data[start_date];
      schedule.start_date = data[start_date];
      schedule.end_date = data[end_date];
      schedule.details = data[details];
      schedule.save();
      res.redirect('/data');
    });
  else if (data[mode] == "inserted") {
    const myevent = new Schedule({
      text:  data[text],
      start_date: data[start_date],
      end_date: data[end_date],
      details: data[details],
      meeting_status: "open"
    });
    myevent.save();
    res.redirect('/data');
  }
  else if (data[mode] == "deleted")
    Schedule.removeById( sid, update_response);
  else
    res.send("Not supported operation");  
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.render('errorpage', {message: 'Login required to access this page.'});
    }
}

//https://answers.acrobatusers.com/How-do-I-calculate-minutes-difference-between-two-time-fields-q241200.aspx
function parseTime(cTime)
{
  if (cTime == '') return null;
  var d = new Date();
  var time = cTime.match(/(\d+)(:(\d\d))?\s*(p?)/);
  d.setHours( parseInt(time[1]) + ( ( parseInt(time[1]) < 12 && time[4] ) ? 12 : 0) );
  d.setMinutes( parseInt(time[3]) || 0 );
  d.setSeconds(0, 0);
  return d;
}

//https://stackoverflow.com/questions/17446466/add-15-minutes-to-string-in-javascript
function addMinutes(time, minsToAdd) {
  function D(J){ return (J<10? '0':'') + J;};
  var piece = time.split(':');
  var mins = piece[0]*60 + +piece[1] + +minsToAdd;

  return D(mins%(24*60)/60 | 0) + ':' + D(mins%60);  
}  

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});