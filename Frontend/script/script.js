// --- FORM SWITCHING LOGIC ---

// Get references to the elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignupLink = document.getElementById('switch-to-signup');
const switchToLoginLink = document.getElementById('switch-to-login');
const messageArea = document.getElementById('message-area');

// Function to display a temporary message
function displayMessage(text, isError = true) {
    messageArea.textContent = text;
    messageArea.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        messageArea.textContent = '';
    }, 5000);
}

// Switch from Login to Signup
switchToSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    messageArea.textContent = ''; // Clear message on switch
});

// Switch from Signup to Login
switchToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    messageArea.textContent = ''; // Clear message on switch
});


// --- FORM SUBMISSION HANDLING (FRONTEND ONLY) ---

// Handle standard Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // ⚠️ IMPORTANT: In a real application, you would send these
    // credentials to a server-side endpoint for secure authentication.
    // The server would check the database, hash the password, and return a
    // token or session ID upon success.

    displayMessage(`Attempting to log in user: ${email}... (Sent to Server)`, false);
    
    // Simulating a successful response (replace with actual fetch to server)
    // fetch('/api/login', { /* ... */ })
    // .then(response => { /* ... */ })
    
    // For demonstration:
    console.log(`Login attempted for: ${email}`);
    setTimeout(() => {
        // Assume failure for demo
        displayMessage('Login failed: Invalid credentials or server error.', true);
        // On success, redirect to '/dashboard' or set a session cookie.
    }, 1500);
});

// Handle standard Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // ⚠️ IMPORTANT: In a real application, you would send this data 
    // to a server-side endpoint. The server would securely hash and store
    // the password, then create the user account.

    displayMessage(`Attempting to sign up new user: ${email}... (Sent to Server)`, false);

    // Simulating a successful response (replace with actual fetch to server)
    // fetch('/api/signup', { /* ... */ })
    // .then(response => { /* ... */ })
    
    // For demonstration:
    console.log(`Signup attempted for: Name: ${name}, Email: ${email}`);
    setTimeout(() => {
        // Assume success for demo
        displayMessage('Sign up successful! Please log in now.', false);
        // Switch to login form after successful signup
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }, 1500);
});


// --- GOOGLE SIGN-IN HANDLER (GLOBAL FUNCTION) ---

// This function is called by Google's script upon successful sign-in
function handleGoogleLogin(response) {
    // ⚠️ CRITICAL: The 'response' contains a credential (JWT ID token).
    // This token MUST be sent to your SERVER-SIDE endpoint for verification.
    // NEVER trust a token verified only on the client-side.
    
    const idToken = response.credential;
    
    displayMessage("Google Sign-In successful on frontend. Sending token to server...", false);

    // Example of what a server request might look like:
    /*
    fetch('/api/google-auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // User is authenticated, proceed with application
            displayMessage('Authentication complete! Redirecting...', false);
            // window.location.href = '/dashboard';
        } else {
            displayMessage('Server failed to verify Google login.', true);
        }
    })
    .catch(error => {
        displayMessage('Error communicating with authentication server.', true);
    });
    */
    
    // For demonstration:
    console.log("Google ID Token:", idToken.substring(0, 50) + '...');
    setTimeout(() => {
        displayMessage('Google login processed. (Check Console for Token)', false);
    }, 1000);
}