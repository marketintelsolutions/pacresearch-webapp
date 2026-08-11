import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, KeyRound, Building2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { updateMyProfile, resetPassword } from "../../store/customerAuthSlice";
import PageBanner from "../../components/Layout/PageBanner";

const ProfileSettings = () => {
  const dispatch = useAppDispatch();
  const { profile, organization, user } = useAppSelector((state) => ({
    profile: state.customerAuth.profile,
    organization: state.customerAuth.organization,
    user: state.customerAuth.user,
  }));

  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSavedMsg(null);
    setErrMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setErrMsg(null);
    try {
      await dispatch(updateMyProfile(form)).unwrap();
      setSavedMsg("Your profile has been updated.");
    } catch (err) {
      setErrMsg(typeof err === "string" ? err : "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user?.email) return;
    setResetting(true);
    setResetMsg(null);
    try {
      await dispatch(resetPassword(user.email)).unwrap();
      setResetMsg(`A password reset link has been sent to ${user.email}.`);
    } catch (err) {
      setResetMsg(
        typeof err === "string" ? err : "Could not send the reset email."
      );
    } finally {
      setResetting(false);
    }
  };

  const isCorporate = profile?.type === "corporate";

  return (
    <>
      <PageBanner text="MY PROFILE" />
      <section className="w-full px-6 xl:px-0 max-w-[720px] mx-auto mt-[60px] mb-20">
        <Link
          to="/account"
          className="text-secondaryBlue border border-secondaryBlue px-4 py-2 rounded-[16px] hover:underline text-sm font-['Inter']"
        >
          My reports
        </Link>

        {/* Profile details */}
        <div className="mt-6 bg-white rounded-2xl border border-primaryBlue/10 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-2 rounded-full bg-primaryBlue/5 text-primaryBlue">
              <User size={18} />
            </span>
            <h2 className="text-lg font-semibold text-primaryBlue">
              Profile details
            </h2>
          </div>

          {savedMsg && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-700 text-sm">
              {savedMsg}
            </div>
          )}
          {errMsg && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isCorporate ? "Contact person" : "Full name"}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-secondaryBlue focus:border-secondaryBlue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Email can't be changed here.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-secondaryBlue focus:border-secondaryBlue"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-secondaryBlue focus:border-secondaryBlue"
              />
            </div>

            {isCorporate && organization && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-primaryBlue/[0.03] border border-primaryBlue/10 text-sm text-gray-600">
                <Building2 size={16} className="text-primaryBlue" />
                <span>
                  Organisation: <strong>{organization.orgName}</strong>
                  {organization.industry ? ` • ${organization.industry}` : ""}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="mt-6 bg-white rounded-2xl border border-primaryBlue/10 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-full bg-primaryBlue/5 text-primaryBlue">
              <KeyRound size={18} />
            </span>
            <h2 className="text-lg font-semibold text-primaryBlue">Password</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            We'll email you a secure link to set a new password.
          </p>

          {resetMsg && (
            <div className="mb-4 p-3 rounded bg-blue-50 text-primaryBlue text-sm">
              {resetMsg}
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-5 py-2.5 border border-primaryBlue text-primaryBlue rounded-full font-semibold hover:bg-primaryBlue hover:text-white transition disabled:opacity-50"
          >
            {resetting ? "Sending…" : "Send password reset email"}
          </button>
        </div>
      </section>
    </>
  );
};

export default ProfileSettings;
