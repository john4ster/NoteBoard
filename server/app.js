const express = require('express');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const cors = require('cors');

//Authentication Packages
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');


const uuid = require('uuid').v4;


//Setup bcrypt library to help hash passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;
//Setup the database
const mysql = require('mysql');
const { response } = require('express');

//Connect to the database
const db = mysql.createConnection({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.database
});

db.connect(function(err) {
  if (err) throw err;
})

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

//Modules to use for the user authentication
app.use(cookieParser());

app.use(session({
  secret: 'vfxednixweqgdsjipjjhyylgyvvtzygp',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

//Get routes for the static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

//Post route to insert new users into the database when somebody registers
app.post('/createNewUser', (req, res) => {
  let newUsername = req.body.newUsername;
  let newPassword = req.body.newPassword;
  let userID = uuid(); //Generate random userID using uuid

  let newUserData = 'INSERT INTO users (username, password, userID) VALUES (?, ?, ?)';//Use the question marks as placeholders


  userExistsCheck = db.query('SELECT * from users WHERE username = ?', [newUsername], async (err, results) => {

    if (results.length === 0) //If user isn't in database, continue register process
    {
     bcrypt.hash(newPassword, saltRounds, function(err, hash) { //Hash the password before putting it in database
       db.query(newUserData, [newUsername, hash, userID], function(err, result) {
         if (err) throw err;
       });
     });
    }

    else //Otherwise, user already exists, stop the register process and inform the user 
    {
    }

   });
  //Use bcrypt to hash the password before putting it in the database
}); //End of createNewUser block

//Route to login post request
app.post('/loginUser', async (req, res) => {
  let username = req.body.username; //For the JWT token
  let enteredUsername = req.body.username; //To check against the database
  let enteredPassword = req.body.password; //To check against the database

  //Check if the user exists in the database
  userCheck = db.query('SELECT * from users WHERE username = ?', [enteredUsername], async (err, results) => {

    if (results.length === 0) //If there are no results, the user does not exist in the database
    {
      const loginResults = { //JSON object to send the results of the login attempt
        userName: 'Not found' //Stops at user not found because it didn't check the password
      }

      res.json(loginResults); //Respond with the loginResults (user not found)
    }

    else //Otherwise, user exists, and the program checks the password
    { 
      //Check if the entered password is equal to the hashed password
      if (await bcrypt.compare(enteredPassword, results[0].password)) //If passwords match, log in the user
      {
        //Get userID of the current user from the database
        let userID = results[0].userID;

        //Create the token
        const token = jwt.sign({username, userID}, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        })

        //Create a cookie for the user
        const cookieOptions = {
          expiresIn: new Date( //Expires JWT_COOKIE_EXPIRES from now
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
          //httpOnly: true
        }

        res.cookie('jwt', token, cookieOptions); //Give the user a cookie to use
        res.status(302).redirect('/'); //Redirect user to homepage
      }

      else //If passwords don't match, tell the user it's an incorrect password
      {
        const loginResults = { //JSON object to send the results of the login attempt
          userName: 'Correct', //Username is correct
          password: 'Incorrect' //However, password is incorrect
        }
  
        res.json(loginResults); //Respond with the loginResults object (wrong password)
      };

    };
  });

}); //End of login user block

//Post request to create a new note for the user
app.post('/createNewNote', (req, res) => {
  let userID = req.body.noteUserID;
  let userNote = req.body.userNote;

  let newNote = 'INSERT INTO notes (userID, note) VALUES (?, ?)'; //Use the question marks as placeholders

  //Add the note data into the notes database
  db.query(newNote, [userID, userNote], function(err, result) {
    if (err) throw err;
  });
})

//Get request to get the notes from the database for the current user
app.post('/getNotes', (req, res) => {
  //Use the userID that was sent to find the correct notes in the database
  let userID = req.body.userID;

  //Get the notes from the note table where userID = current user
  getUsersNotes = db.query('SELECT note FROM notes WHERE userID = ?', [userID], async (err, results) => 
  {

    //Make a JSON object to send to the front end with an array of notes
    let notes = {
      noteArray: []
    }

    //Get each note from the database
    for (let i = 0; i < results.length; i++)
    {
      let userNote = results[i].note;
      //Add each note to the JSON object's array
      notes.noteArray.push(userNote);
    }

    //Respond with the JSON object
    res.json(notes);
  });
})

//Route for when the user wants to delete notes
app.post('/deleteNotes', (req, res) => {
  let userID = req.body.userID;
  let notesToDeleteArray = req.body.notesToDeleteArray;

  //For each note in the array, search the datbase for a row that has both the userID and that note. If there is no row matching that, do nothing and continue, if there is a row matching that, remove it from the notes table
  for (let i = 0; i < notesToDeleteArray.length; i++)
  {

    let deleteNotesQuery = 'DELETE FROM notes WHERE userID = ? AND note = ?';
    db.query(deleteNotesQuery, [userID, notesToDeleteArray[i]], function(err, result) {
      if (err) throw err;
    });
  }
})

console.log('Listening on port 3000');
app.listen(3000);