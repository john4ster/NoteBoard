# NoteBoard
NoteBoard is a simple full stack web app where the user can log in and create, view, save, and delete notes.

# What I learned
* How to make a fullstack web application with a front end, back end, and database
* How to use a MySQL database to store users and user data
* How to make a simple and secure login system from scratch
* How cookies work and how to use them
* How JWT works and how to use it for user authorization

# How to run
* Change the .env.examples information to fit your MySQL database information
* In the server directory, run "node app.js"
* Go to "localhost:3000" in your browser

# Database Setup
* The database needs two tables, a user table and a notes table
* The user table has a username column, an encrypted password column, and a userID column
* The notes table has a note column, and a userID column
* The userID is what connects the user to that user's notes

# Technologies used
* Front-end: HTML, CSS, and Javascript
* Back-end: NodeJS
* Database: MySQL
