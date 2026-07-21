import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginCustomer, clearAuthError } from "../../store/customerAuthSlice";
import PageBanner from "../../components/Layout/PageBanner";
import PasswordInput from "../../components/Account/PasswordInput";

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
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
            inputClassName="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link
            to="/account/forgot-password"
            state={{ email }}
            className="text-secondaryBlue hover:underline"
          >
            Forgot password?
          </Link>
          <Link to="/account/signup" className="text-secondaryBlue hover:underline">
            Create an account
          </Link>
        </div>
      </section>
    </>
  );
};

export default Login;
