document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const emailInput = document.getElementById("email").value;
      const passwordInput = document.getElementById("password").value;

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      }) //ส่งแล้ว ได้ response กลับมา
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
          return response.json();
        }) //เอา response มาใช้
        .then((data) => {
          const userRole = data.role;
          const token = data.token; // Extract the token from the response

          // Store the token in localStorage
          localStorage.setItem('authToken', token);
          console.log("JWT stored in localStorage:", token);

          console.log("User Role received:", userRole);
          switch (userRole) {
            case "admin":
              console.log("Redirecting to /Admin/dashboard.html");
              window.location.href = "/Admin/dashboard.html";
              break;
            case "seller":
              console.log("Redirecting to /Seller/shop.html");
              window.location.href = "/Seller/shop.html";
              break;
            case "member":
              console.log("Redirecting to /Member/catalog.html");
              window.location.href = "/Member/catalog.html";
              break;
            default:
              console.log(
                "Default redirection to user.html (or adjust as needed)"
              );
              window.location.href = "user.html";
          }
        })
        .catch((error) => {
          errorMessage.textContent =
            error.message || "Login failed. Please try again.";
        });
    });
  }

  if (document.getElementById("register-form")) {
    const registerForm = document.getElementById("register-form");
    const registerErrorMessage = document.getElementById(
      "register-error-message"
    );
    const registerSuccessMessage = document.getElementById(
      "register-success-message"
    );

    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const emailInput = document.getElementById("reg-email").value;
      const passwordInput = document.getElementById("reg-password").value;
      const roleInput = document.getElementById("reg-role").value;

      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          role: roleInput,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
          return response.json();
        })
        .then((data) => {
          registerErrorMessage.textContent = "";
          registerSuccessMessage.textContent =
            "Registration successful!\nYou can now login.";
        })
        .catch((error) => {
          registerSuccessMessage.textContent = "";
          const errorMessages = error.message.split(". "); // Split error message string by ". "
          const firstErrorMessage = errorMessages[0]; // Take the first error
          registerErrorMessage.textContent =
            firstErrorMessage || "Registration failed. Please try again.";
        });
    });
  }

  // Google Sign-in implementation
  function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    fetch('/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: response.credential }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('Google sign-in successful, JWT stored:', data.token);
      } else if (data.message) {
        console.error('Google sign-in error:', data.message);
        const googleSignInButton = document.getElementById("google-sign-in-button");
        if (googleSignInButton) {
            googleSignInButton.textContent = data.message; // Display error on the button
            googleSignInButton.classList.add('error'); // Optionally add a CSS class for styling
        }
      }
    });
  }

  function initializeGoogleSignIn(clientId) {
    console.log("Initializing Google Sign-In with Client ID:", clientId);
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("google-sign-in-button"),
      { theme: "outline", size: "large" }
    );
    google.accounts.id.prompt();
  }

  fetch('/api/config')
    .then(response => response.json())
    .then(config => {
      initializeGoogleSignIn(config.googleClientId);
    })
    .catch(error => {
      console.error("Error fetching Google Client ID:", error);
      // Optionally display an error message to the user
    });
});