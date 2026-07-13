import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  loginCustomer,
  resetPassword,
  clearAuthError,
} from "../../store/customerAuthSlice";
import PageBanner from "../../components/Layout/PageBanner";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/account";

  const { user, loading, error } = useAppSelector((state) => ({
    user: state.customerAuth.user,
    loading: state.customerAuth.loading,
    error: state.customerAuth.error,
  }));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginCustomer({ email, password }));
  };

  const handleReset = async () => {
    if (!email) {
      setNotice("Enter your email above first, then click reset.");
      return;
    }
    const res = await dispatch(resetPassword(email));
    if (resetPassword.fulfilled.match(res)) {
      setNotice("Password reset email sent (if the account exists).");
    }
  };

  return (
    <>
      <PageBanner text="ACCOUNT" />
      <section className="w-full px-6 max-w-[440px] mx-auto mt-[60px] mb-20">
        <h1 className="text-2xl font-bold text-primaryBlue mb-6">Sign in</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <button
            onClick={handleReset}
            className="text-secondaryBlue hover:underline"
          >
            Forgot password?
          </button>
          <Link to="/account/signup" className="text-secondaryBlue hover:underline">
            Create an account
          </Link>
        </div>
      </section>
    </>
  );
};

export default Login;
