//Login as an existing user
const login = document.getElementsByClassName('loginButton');
const loginForm = document.getElementById('loginForm');
const loginURL = 'http://localhost:3000/loginUser';
const loginErrorBox = document.querySelector('.errorMessage');

if (loginForm) 
{
  loginForm.addEventListener('submit', (loginEvent) => {
    loginEvent.preventDefault();
    const formData = new FormData(loginForm);
    let username = formData.get('loginUsername');
    let password = formData.get('loginPassword');
    loginForm.reset();
  
    let user = { //Create a user object that will be sent to the backend and compared to the user database
      username,
      password
    };
  
    fetch(loginURL, { //Send the user object to the backend in JSON format to be checked against the database
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify(user),
      headers: {
        'content-type': 'application/json'
      }
      
    }).then( async (response) => { //Redirect user to home page after successful login
      if (response.redirected) //User successfully logs in and gets redirected
      {
          window.location.href = response.url;
      }
      else //Otherwise the user failed to log in for one of 2 reasons
      {
        const loginResult = await response.json(); //Get the data from the server about why the login failed
  
        //If else statements to display the reason for why user couldn't log in
  
        if (loginResult.userName == 'Not found') //If the username doesn't exist
        {
          //Display user not found in loginErrorBox
          loginErrorBox.style.display = 'flex';
          loginErrorBox.innerHTML = 'User not found.';
        }
        
        else if (loginResult.password == 'Incorrect') //If the username is correct, but the password is wrong
        {
          //Display incorrect password in loginErrorBox
          loginErrorBox.style.display = 'flex';
          loginErrorBox.innerHTML = 'Incorrect Password.';
        }
  
        else
        {
          loginErrorBox.style.display = 'flex';
          loginErrorBox.innerHTML = 'Whoops! Looks like an error happened on our end. Please try again.';
        }
      }
    })
    .catch(function(err) { //Error catch
      console.info(err + " url: " + url);
    });
  
  });
}



