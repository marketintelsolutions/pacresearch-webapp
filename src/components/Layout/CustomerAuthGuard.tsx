import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAppSelector } from "../../hooks/redux";

interface Props {
  children: React.ReactNode;
  /** When true, also require an active purchase for the :editionId route param. */
  requireEntitlement?: boolean;
}

const Spinner = () => (
  <div className="py-32 flex justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primaryBlue border-r-transparent" />
  </div>
);

/**
 * Customer-facing route guard, modeled on AdminLayout. Redirects unauthenticated
 * users to the login page (preserving where they came from). With
 * requireEntitlement it additionally verifies the signed-in user (or their org)
 * owns the edition named by the :editionId route param before rendering.
 */
const CustomerAuthGuard: React.FC<Props> = ({ children, requireEntitlement }) => {
  const location = useLocation();
  const { editionId } = useParams<{ editionId: string }>();
  const { user, profile, authReady, isAdmin } = useAppSelector((state) => ({
    user: state.customerAuth.user,
    profile: state.customerAuth.profile,
    authReady: state.customerAuth.authReady,
    isAdmin: state.customerAuth.isAdmin,
  }));

  const [entitlementState, setEntitlementState] = useState<
    "checking" | "granted" | "denied"
  >(requireEntitlement ? "checking" : "granted");

  useEffect(() => {
    if (!requireEntitlement || !user || !editionId) return;
    let cancelled = false;

    (async () => {
      try {
        const checks = [
          getDocs(
            query(
              collection(db, "purchases"),
              where("editionId", "==", editionId),
              where("customerUid", "==", user.uid),
              where("status", "==", "active")
            )
          ),
        ];
        if (profile?.organizationId) {
          checks.push(
            getDocs(
              query(
                collection(db, "purchases"),
                where("editionId", "==", editionId),
                where("organizationId", "==", profile.organizationId),
                where("status", "==", "active")
              )
            )
          );
        }
        const snaps = await Promise.all(checks);
        const owned = snaps.some((s) => !s.empty);
        if (!cancelled) setEntitlementState(owned ? "granted" : "denied");
      } catch {
        if (!cancelled) setEntitlementState("denied");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requireEntitlement, user, editionId, profile?.organizationId]);

  // Wait for Firebase Auth — and the admin-role lookup — to resolve.
  if (!authReady || (user && isAdmin === null)) return <Spinner />;

  if (!user) {
    return (
      <Navigate to="/account/login" replace state={{ from: location.pathname }} />
    );
  }

  // Administrators belong in the admin area, not the customer dashboard.
  if (isAdmin) {
    return <Navigate to="/admin/report-archive" replace />;
  }

  if (requireEntitlement) {
    if (entitlementState === "checking") return <Spinner />;
    if (entitlementState === "denied") {
      return <Navigate to="/account" replace />;
    }
  }

  return <>{children}</>;
};

export default CustomerAuthGuard;
