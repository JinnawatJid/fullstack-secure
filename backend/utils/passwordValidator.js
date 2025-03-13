const validatePassword = (password) => {
    const passwordErrors = [];
 
    if (password.length < 8) {
      passwordErrors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("Password must contain at least one number.");
    }
    if (!/[^a-zA-Z0-9\s]/.test(password)) {
      passwordErrors.push(
        "Password must contain at least one special character (e.g., !@#$%^&*)."
      );
    }
 
    return passwordErrors;
  };
 
  module.exports = validatePassword;