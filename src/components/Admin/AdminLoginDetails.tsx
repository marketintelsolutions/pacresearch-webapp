import React, { useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  AuthError,
  UserCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

const AdminLoginDetails = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Customers share this Firebase project, so signing in successfully does
      // not make you an admin — the account needs an active adminUsers doc.
      const adminSnap = await getDoc(
        doc(db, "adminUsers", userCredential.user.uid)
      );
      if (!adminSnap.exists() || adminSnap.data()?.active !== true) {
        await signOut(auth);
        setError(
          "This account doesn't have administrator access. Use your admin account, or sign in as a customer at /account/login."
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(userCredential.user));
      localStorage.setItem("isAuth", JSON.stringify(true));

      navigate("/admin/macroeconomics");
    } catch (err) {
      setError((err as AuthError).message);
    }
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
          <div className="py-5 px-6 rounded-full border border-gray-500 flex items-center gap-3">
            <label htmlFor="password">
              <Lock />
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="bg-transparent w-full focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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
