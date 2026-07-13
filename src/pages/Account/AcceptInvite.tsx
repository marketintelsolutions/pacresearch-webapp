import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import { callAcceptOrgInvite } from "../../firebase/functions";
import PageBanner from "../../components/Layout/PageBanner";

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const inviteId = params.get("inviteId") || "";
  const navigate = useNavigate();
  const { user, authReady } = useAppSelector((state) => ({
    user: state.customerAuth.user,
    authReady: state.customerAuth.authReady,
  }));

  const [state, setState] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      navigate(
        `/account/login`,
        { state: { from: `/account/accept-invite?inviteId=${inviteId}` } }
      );
    }
  }, [authReady, user, inviteId, navigate]);

  const accept = async () => {
    if (!inviteId) {
      setState("error");
      setMessage("Missing invite link.");
      return;
    }
    setState("working");
    try {
      await callAcceptOrgInvite({ inviteId });
      setState("done");
    } catch (e) {
      setState("error");
      setMessage((e as { message?: string })?.message || "Could not accept invite.");
    }
  };

  return (
    <>
      <PageBanner text="ACCOUNT" />
      <section className="w-full px-6 max-w-[440px] mx-auto mt-[60px] mb-20 text-center">
        <h1 className="text-2xl font-bold text-primaryBlue mb-4">
          Join organisation
        </h1>

        {state === "done" ? (
          <div>
            <p className="text-green-700 mb-4">
              You've joined the organisation. You now share its report access.
            </p>
            <Link
              to="/account"
              className="inline-block px-5 py-3 bg-primaryBlue text-white rounded-full font-semibold"
            >
              Go to my account
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">
              Accept this invite to join the organisation and share access to its
              purchased reports.
            </p>
            {state === "error" && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {message}
              </div>
            )}
            <button
              onClick={accept}
              disabled={state === "working"}
              className="px-6 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {state === "working" ? "Joining…" : "Accept invite"}
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default AcceptInvite;
