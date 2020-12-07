//Base app functionality
let notes = document.querySelector('.notes'); //Notes div in the html
let notesToDelete = document.querySelector('.notesToDelete');
//Create note
const newNoteButton = document.querySelector('.newNoteButton');
const modalbg = document.querySelector('.modalbg');
const delmodalbg = document.querySelector('.delmodalbg');
const closeModal = document.querySelector('.closeModal');
const delcloseModal = document.querySelector('.delcloseModal');
const submitNoteButton = document.querySelector('.submitNoteButton');
const deleteNoteButtonModal = document.querySelector('.deleteNoteButtonModal');

//Delete note
const deleteNoteButton = document.querySelector('.deleteNoteButton');

//Attributes for the top right
const topRight = document.querySelector('.navLinks'); //The nav links at the top right for login
const registerButton = document.getElementById('register'); //Register button
const loginButton = document.getElementById('login'); //Login button when not signed in

//Routes to communicate with the back end
const newNoteURL = 'http://localhost:3000/createNewNote'; //Route to add notes to the database
const getNotesURL = 'http://localhost:3000/getNotes'; //Route to get notes from the database
const deleteNotesURL = 'http://localhost:3000/deleteNotes';

//Get token to see which user it is
//Split the cookie title from the actual cookie
let cookie = document.cookie.split('=');

const noteList = []; //List of notes either to be displayed on the screen if not logged in, or sent to the database and displayed on the screen if logged in
const notesToDeleteArray = [];



window.onload = function loadNotes() {
  //If statement to change the front end if the user is logged in (displaying the username instead of register/login) 
if (cookie != '')
{
    //Decode JWT
    let tokens = cookie[1].split('.');

    let jwtPayload = atob(tokens[1]);

    //Turn it into a real json object
    let jwtObject = JSON.parse(jwtPayload);

    //Get the username from the jwt
    let username = jwtObject.username

    //Create a username display element and replace the register button with the current user's username
    let usernameDisplay = document.createElement('li');
    usernameDisplay.innerHTML = username;
    usernameDisplay.className = 'usernameDisplay';
    registerButton.parentNode.replaceChild(usernameDisplay, registerButton);

    //Create a logout button element and replace the login button with it
    let logoutButton = document.createElement('button');
    logoutButton.innerHTML = 'Logout';
    logoutButton.className = 'logoutButton';
    loginButton.parentNode.replaceChild(logoutButton, loginButton);

    //Logout button event listener
    document.querySelector('.logoutButton').addEventListener('click', function logout() {
      //Delete the cookie so the user data is done
      document.cookie = 'jwt' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      //Reload the page
      location.reload();
      return false;
    })

    //Fetch request to post the userID to the server
    fetch(getNotesURL, {
      method: 'POST',
      body:  JSON.stringify(jwtObject),
      headers: {
        'content-type': 'application/json'
      }
    })
    .then(async (response) => { //Redirect user to home page after successful login
      //Get the noteArray from the response
      let noteResponse = await response.json();
      //Put it into a variable to get the noteArray
      let noteArray = await noteResponse.noteArray; //This will be the array of each of the user's notes

      //For each note in the note array, add the note to the note list
      for (let j = 0; j < noteArray.length; j++)
      {
        noteList.push(noteArray[j]);
      }

      let noteInput = document.querySelector('.noteInput'); //Get input from the textArea

      let notes = document.querySelector('.notes'); //Notes div in the html
      if (notes.length != 0) //If there are already notes, clear them before doing the for loop
      {
        notes.innerHTML = '';
      }
      //For each note in the noteList, display it in the html
      for (let k = 0; k < noteList.length; k++)
      {
        let note = document.createElement('note'); //Create an element for each note
        note.innerHTML = noteList[k]; //Make the text of each note
        note.className = 'note'; //Add the note to the note class for CSS styling
        notes.appendChild(note); //Append each note to the notes div
        noteInput.value = ''; //Reset the textarea to empty
      }

    })
    
} //End of changing front end to fit the current user
} //End of onload function

newNoteButton.addEventListener('click', function showNotePopup() {
  modalbg.style.display = 'flex';
  window.scrollTo(0,0);
  document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', function closeNotePopup() {
  modalbg.style.display = 'none';
  document.body.style.overflow = 'visible';
});

submitNoteButton.addEventListener('click', function submitNote() {
    let noteInput = document.querySelector('.noteInput'); //Get input from the textArea

    noteList.push(noteInput.value); //Add the note to the array of notes to be displayed

    //If the cookie isn't blank, the user's logged in, and we can use that cookie to access the account to save the note to the database
    if (cookie != '')
    {

      //Decode JWT
      let tokens = cookie[1].split('.');

      let jwtPayload = atob(tokens[1]);

      //Turn it into a real json object
      let jwtObject = JSON.parse(jwtPayload);

      //Get the userID from the user
      let noteUserID = jwtObject.userID
      //Get the note
      let userNote = noteInput.value;

      //Create a note json object to be sent to the back end
      //Only if the note isn't blank
      if (userNote != null)
      {
        let newNoteInfo = {
          noteUserID: noteUserID,
          userNote: userNote
        }
  
        //Send a post request to the server for the note to be added to the database under that user id
        fetch (newNoteURL, {
          method: 'POST',
          body: JSON.stringify(newNoteInfo),
          headers: {
            'content-type': 'application/json'
          }
        })
      }
    
    } //End of adding note for if the user is logged in


    //Whether the user is logged in or not, the following code applies
    modalbg.style.display = 'none'; //Close the note after the submit button is pressed
    document.body.style.overflow = 'visible';

    if (notes.length != 0) //If there are already notes, clear them before doing the for loop
    {
      notes.innerHTML = '';
    }
    //For each note in the noteList, display it in the html
    for (let m = 0; m < noteList.length; m++)
    {
      let note = document.createElement('note'); //Create an element for each note
      note.innerHTML = noteList[m]; //Make the text of each note
      note.className = 'note'; //Add the note to the note class for CSS styling
      notes.appendChild(note); //Append each note to the notes div
      noteInput.value = ''; //Reset the textarea to empty
    }

}) //End of submitNoteButton event listener

//Event listener for the button that brings up the delete note modal
deleteNoteButton.addEventListener ('click', function showDeleteNotePopup() {
  delmodalbg.style.display = 'flex';
  window.scrollTo(0,0);
  document.body.style.overflow = 'hidden';
  //Display each note in the modal for the user to select one 
  //Make each note a button that the user can click. When that is clicked, add it's value to an array

  //Stops the modal from displaying duplicate buttons when clicked on more than once
  if (noteList.length != 0) //If there are already notes, clear them before doing the for loop
  {
    notesToDelete.innerHTML = '';
  }

  for (let d = 0; d < noteList.length; d++)
    {
      let noteToDeleteButton = document.createElement('button');
      noteToDeleteButton.innerHTML = noteList[d];
      noteToDeleteButton.className = 'noteToDelete';
      notesToDelete.appendChild(noteToDeleteButton);

      //Event listener for each note button created
      noteToDeleteButton.addEventListener('click', function addToDeleteArray() {
        //If the note isn't selected, turn it red and add it to the array
        if (noteToDeleteButton.style.background != 'red')
        {
          noteToDeleteButton.style.background = 'red';
          notesToDeleteArray.push(noteToDeleteButton.innerText);
          //When the last delete button is pressed, send the array to back end and delete those notes from the database for that user
          
          //Event listener for the bottom delete notes button in the modal
          deleteNoteButtonModal.addEventListener ('click', function deleteNoteFromDatabase () {
            //Get userID from the jwt so they can't delete notes under other user id's
            let tokens = cookie[1].split('.');
            let jwtPayload = atob(tokens[1]);
            let jwtObject = JSON.parse(jwtPayload);
            let userID = jwtObject.userID;
            //Make the JSON to send to the back end
            let notesToDeleteObject = {
              userID: userID,
              notesToDeleteArray: notesToDeleteArray
            }

            //Make a fetch request to the back end /deleteNotes route
            fetch (deleteNotesURL, {
              method: 'POST',
              body: JSON.stringify(notesToDeleteObject),
              headers: {
                'Content-Type': 'application/json'
              }
            })

            delmodalbg.style.display = 'none';
            document.body.style.overflow = 'visible';
            location.reload();
          })

        }
        //If the note is selected, turn it back to normal and remove it from the array
        else 
        {
          noteToDeleteButton.style.background = '#FFFF88';
          //Remove the note from the array so it's not send to the back end for deletion
          delete notesToDeleteArray[notesToDeleteArray.indexOf(noteToDeleteButton.innerHTML)];
        }
      })
    }
})


delcloseModal.addEventListener('click', function closeNotePopup() {
  delmodalbg.style.display = 'none';
  document.body.style.overflow = 'visible';
});

