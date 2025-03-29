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
      }) //ส่งแล้ว ได้ response กลับมา
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

  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    const userRole = localStorage.getItem("userRole");
    const email = localStorage.getItem("email");
    const emailDisplay = document.getElementById("email-display");
    const logoutButton = document.getElementById("logout-button");

    if (!userRole) {
      window.location.href = "index.html";
    } else {
      if (emailDisplay) {
        emailDisplay.textContent = email || "User";
      }

      const pageType = dashboardContainer.classList.contains("admin-dashboard")
        ? "admin"
        : dashboardContainer.classList.contains("manager-dashboard")
        ? "manager"
        : "user";

      if (pageType !== userRole) {
        alert(
          "Unauthorized access. You are being redirected to your assigned dashboard."
        );
        switch (userRole) {
          case "admin":
            window.location.href = "admin.html";
            break;
          case "manager":
            window.location.href = "manager.html";
            break;
          default:
            window.location.href = "user.html";
        }
      }
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("userRole"); // Clear role on logout
        localStorage.removeItem("email"); // Clear email
        window.location.href = "index.html"; // Redirect to login page
      });
    }
  }
});
