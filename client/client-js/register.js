//Register a new user
const register = document.getElementsByClassName('registerButton');
const registerForm = document.getElementById('registerForm');
const registerURL = 'http://localhost:3000/createNewUser';
//When the user presses the register button, get the info from the form
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  let newUsername = formData.get('username');
  let newPassword = formData.get('password');
  let confirmPassword = formData.get('confirmPassword')
  registerForm.reset();

  //Make sure new password and confirm password are equal
  if (newPassword == confirmPassword) {
    if (newUsername != "" && newPassword != ""){ //Make sure user enters something for both fields
      
      let newUser = { //Create an object to send to the back end
        newUsername,
        newPassword
      };

      fetch(registerURL, { //Send the newUser object to the backend in JSON format to be added to the database
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(newUser),
        headers: {
          'content-type': 'application/json'
        }
      });

    }
  }
  else { //If newPassword and confirmPassword are not equal, ask the user to enter them correctly
    const registerWarning = document.getElementById('registerWarning');
    registerWarning.innerText = 'Password and Confirm Password do not match';
    registerWarning.style.padding = "10px";
    registerWarning.style.background = 'red';
  };

});