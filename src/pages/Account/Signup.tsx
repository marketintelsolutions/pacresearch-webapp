import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  signUpIndividual,
  signUpCorporate,
  clearAuthError,
} from "../../store/customerAuthSlice";
import { CustomerType } from "../../types";
import PageBanner from "../../components/Layout/PageBanner";
import PasswordRequirements from "../../components/Account/PasswordRequirements";
import PasswordInput from "../../components/Account/PasswordInput";
import GoogleSignInButton from "../../components/Account/GoogleSignInButton";
import { isPasswordValid, passwordError } from "../../utils/passwordPolicy";

const Signup = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => ({
    user: state.customerAuth.user,
    loading: state.customerAuth.loading,
    error: state.customerAuth.error,
  }));

  const [type, setType] = useState<CustomerType>("individual");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    location: "",
    orgName: "",
    industry: "",
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, type]);

  useEffect(() => {
    if (user) navigate("/account", { replace: true });
  }, [user, navigate]);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const [policyError, setPolicyError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const failure = passwordError(form.password);
    if (failure) {
      setPolicyError(failure);
      return;
    }
    setPolicyError("");
    if (type === "individual") {
      dispatch(
        signUpIndividual({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
          location: form.location,
        })
      );
    } else {
      dispatch(
        signUpCorporate({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
          orgName: form.orgName,
          industry: form.industry,
        })
      );
    }
  };

  return (
    <>
      <PageBanner text="ACCOUNT" />
      <section className="w-full px-6 max-w-[480px] mx-auto mt-[60px] mb-20">
        <h1 className="text-2xl font-bold text-primaryBlue mb-6">
          Create an account
        </h1>

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-full">
          {(["individual", "corporate"] as CustomerType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`py-2 rounded-full text-sm font-semibold capitalize transition ${
                type === t ? "bg-primaryBlue text-white" : "text-primaryBlue"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "corporate" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Organisation name"
                value={form.orgName}
                onChange={(v) => set("orgName", v)}
                required
              />
              <Field
                label="Industry"
                value={form.industry}
                onChange={(v) => set("industry", v)}
              />
            </div>
          )}

          <Field
            label={type === "corporate" ? "Contact person" : "Full name"}
            value={form.name}
            onChange={(v) => set("name", v)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => set("email", v)}
              required
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => set("phone", v)}
            />
          </div>

          {type === "individual" && (
            <Field
              label="City"
              value={form.location}
              onChange={(v) => set("location", v)}
            />
          )}

          <div>
            <PasswordInput
              label="Password"
              value={form.password}
              onChange={(v) => set("password", v)}
              required
              autoComplete="new-password"
              inputClassName="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
            />
            <PasswordRequirements value={form.password} />
            {policyError && (
              <p className="mt-2 text-xs text-red-600">{policyError}</p>
            )}
          </div>

          {type === "corporate" && (
            <p className="text-xs text-gray-500">
              Your organisation includes 3 member seats. You can invite members
              and purchase extra seats from your account.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isPasswordValid(form.password)}
            className="w-full px-4 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-grow h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="flex-grow h-px bg-gray-200" />
        </div>
        <GoogleSignInButton label="Sign up with Google" />
        {type === "corporate" && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            Google sign-up creates an individual account. For a corporate
            account, use the form above.
          </p>
        )}

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/account/login" className="text-secondaryBlue hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, type = "text", required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      required={required}
    />
  </div>
);

export default Signup;
