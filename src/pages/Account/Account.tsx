import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Eye, LogOut } from "lucide-react";
import { db } from "../../firebase/firebaseConfig";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logoutCustomer } from "../../store/customerAuthSlice";
import { fetchMyPurchases } from "../../store/purchasesSlice";
import {
  callGetOrgRoster,
  callInviteOrgMember,
  callInitializeTransaction,
  OrgRoster,
} from "../../firebase/functions";
import { formatNaira } from "../../utils/format";
import PageBanner from "../../components/Layout/PageBanner";

const Account = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { profile, organization, user } = useAppSelector((state) => ({
    profile: state.customerAuth.profile,
    organization: state.customerAuth.organization,
    user: state.customerAuth.user,
  }));
  const { myPurchases, loading } = useAppSelector((state) => ({
    myPurchases: state.purchases.myPurchases,
    loading: state.purchases.loading,
  }));

  const [titles, setTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      dispatch(
        fetchMyPurchases({
          uid: user.uid,
          organizationId: profile?.organizationId ?? null,
        })
      );
    }
  }, [dispatch, user, profile?.organizationId]);

  // Resolve report titles for the purchased reports.
  useEffect(() => {
    const missing = Array.from(
      new Set(myPurchases.map((p) => p.reportId))
    ).filter((id) => !titles[id]);
    if (missing.length === 0) return;
    (async () => {
      const entries: Record<string, string> = {};
      await Promise.all(
        missing.map(async (id) => {
          const snap = await getDoc(doc(db, "reports", id));
          entries[id] = snap.exists()
            ? (snap.data().title as string)
            : "Report";
        })
      );
      setTitles((prev) => ({ ...prev, ...entries }));
    })();
  }, [myPurchases, titles]);

  const handleLogout = async () => {
    await dispatch(logoutCustomer());
    navigate("/report-archive");
  };

  return (
    <>
      <PageBanner text="MY ACCOUNT" />
      <section className="w-full px-6 xl:px-0 max-w-max mx-auto mt-[60px] mb-20">
        {/* Profile header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-primaryBlue">
              {profile?.name || user?.email}
            </h1>
            <p className="text-sm text-gray-500 capitalize">
              {profile?.type || "customer"} account
              {organization ? ` • ${organization.orgName}` : ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Purchases */}
        <h2 className="text-lg font-semibold text-primaryBlue mb-3">
          My Reports
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading your reports…</p>
        ) : myPurchases.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border text-center">
            <p className="text-gray-500 mb-3">You haven't purchased any reports yet.</p>
            <Link
              to="/report-archive"
              className="text-secondaryBlue hover:underline"
            >
              Browse the Report Archive →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPurchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border"
              >
                <div>
                  <p className="font-medium text-primaryBlue">
                    {titles[p.reportId] || "Report"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Purchased {formatNaira(p.price)}
                    {p.loyaltyDiscountApplied
                      ? ` • ${p.loyaltyDiscountPercent}% loyalty`
                      : ""}
                  </p>
                </div>
                <Link
                  to={`/account/report/${p.editionId}/view`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primaryBlue text-white rounded-full text-sm font-semibold hover:opacity-90"
                >
                  <Eye size={14} /> Read
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Corporate seat management */}
        {profile?.type === "corporate" && organization && (
          <OrgSeats organizationId={organization.id} />
        )}
      </section>
    </>
  );
};

// ---- Corporate seat management panel ---------------------------------------
const OrgSeats: React.FC<{ organizationId: string }> = ({ organizationId }) => {
  const [roster, setRoster] = useState<OrgRoster | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async () => {
    try {
      const res = await callGetOrgRoster({ organizationId });
      setRoster(res.data);
    } catch (e) {
      setMsg({ kind: "err", text: readableError(e) });
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await callInviteOrgMember({ organizationId, email: inviteEmail });
      setInviteEmail("");
      setMsg({ kind: "ok", text: "Invite sent." });
      await load();
    } catch (err) {
      setMsg({ kind: "err", text: readableError(err) });
    } finally {
      setBusy(false);
    }
  };

  const buySeat = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await callInitializeTransaction({
        purchaseKind: "seatAddon",
        organizationId,
      });
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setMsg({ kind: "err", text: readableError(err) });
      setBusy(false);
    }
  };

  if (!roster) {
    return (
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-primaryBlue mb-3">
          Organisation Seats
        </h2>
        <p className="text-sm text-gray-500">Loading seats…</p>
      </div>
    );
  }

  const seatsFull = roster.used >= roster.seatLimit;

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold text-primaryBlue mb-3">
        Organisation Seats
      </h2>

      <div className="p-6 bg-white rounded-xl border">
        <p className="text-sm text-gray-600 mb-4">
          <strong>{roster.used}</strong> of{" "}
          <strong>{roster.seatLimit}</strong> seats used.
        </p>

        {msg && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              msg.kind === "ok"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Members */}
        <div className="space-y-2 mb-6">
          {roster.members.map((m) => (
            <div
              key={m.uid}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {m.name || m.email}
                {m.isPrimary && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primaryBlue/10 text-primaryBlue">
                    primary
                  </span>
                )}
              </span>
              <span className="text-gray-400">{m.email}</span>
            </div>
          ))}
          {roster.pendingInvites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between text-sm text-gray-500"
            >
              <span>{inv.email}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                invited
              </span>
            </div>
          ))}
        </div>

        {roster.isPrimaryContact && (
          <>
            <form onSubmit={invite} className="flex gap-2 mb-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite member by email"
                disabled={seatsFull || busy}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                required
              />
              <button
                type="submit"
                disabled={seatsFull || busy}
                className="px-4 py-2 bg-primaryBlue text-white rounded-md hover:opacity-90 disabled:opacity-50"
              >
                Invite
              </button>
            </form>

            {seatsFull && (
              <div className="flex items-center justify-between gap-3 p-3 bg-yellow-50 rounded-md">
                <span className="text-sm text-yellow-800">
                  All seats are in use. Purchase an extra seat to invite more.
                </span>
                <button
                  onClick={buySeat}
                  disabled={busy}
                  className="px-4 py-2 bg-secondaryBlue text-white rounded-md text-sm whitespace-nowrap hover:opacity-90 disabled:opacity-50"
                >
                  Buy a seat
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function readableError(e: unknown): string {
  return (e as { message?: string })?.message || "Something went wrong.";
}

export default Account;
