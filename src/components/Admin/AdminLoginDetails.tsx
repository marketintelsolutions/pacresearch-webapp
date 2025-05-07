import React, { useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { BiSolidLockAlt } from "react-icons/bi";
import { auth } from "../../firebase/firebaseConfig";
import {
  AuthError,
  UserCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

const AdminLoginDetails = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential: UserCredential) => {
        // Signed in
        const user = JSON.stringify(userCredential.user);
        // ...

        // add user details to local storage
        localStorage.setItem("user", user);

        // set isAuth to true add add to localStorage
        localStorage.setItem("isAuth", JSON.stringify(true));
        // setIsAuth(true);

        setError(null);
        navigate("/admin/macroeconomics");
      })
      .catch((error: AuthError) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error);

        setError(error.message);
      });
  };

  return (
    <div className="w-full max-w-[600px] mx-auto bg-white rounded-[30px] my-40 py-16 px-12">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* <h1>Hello Again!</h1> */}
          <h1 className="font-bold text-3xl">Admin Login</h1>
          <p className="mt-2 text-lg font-light">Welcome back</p>

          <div className="py-5 px-6 rounded-full border border-gray-500 flex gap-3">
            <label htmlFor="email">
              <Mail />
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={handleEmailChange}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>
          <div className="py-5 px-6 rounded-full border border-gray-500 flex gap-3">
            <label htmlFor="password">
              <Lock />
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>

          {error && <p>{error}</p>}

          <button
            type="submit"
            className="bg-primaryBlue py-5 rounded-full text-white hover:text-primaryBlue hover:bg-white border border-primaryBlue"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginDetails;
