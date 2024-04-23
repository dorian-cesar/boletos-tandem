import React, { useState } from "react";

const VerPassword = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <img
      alt="Eye Icon"
      title="Eye Icon"
      src={showPassword ? "assets/eye-off.svg" : "assets/eye.svg"}
      className="input__icon"
      onClick={togglePasswordVisibility}
    />
  );
};

export default VerPassword;