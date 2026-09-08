import validator from "validator";

const vlidateSignUpData = (req) => {
  const { firstName, lastName, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("First And Last Name Is Required");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please Enter a Strong Password");
  }
};

export default vlidateSignUpData;
