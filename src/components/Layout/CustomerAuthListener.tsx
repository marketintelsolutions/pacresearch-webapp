import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { useAppDispatch } from "../../hooks/redux";
import {
  setAuthUser,
  setIsAdmin,
  loadProfile,
} from "../../store/customerAuthSlice";

/**
 * Mounted once at the app root. Keeps the customerAuth slice in sync with
 * Firebase Auth, resolves whether the signed-in user is an administrator
 * (an active adminUsers/{uid} document), and loads the customer profile.
 *
 * Admin and customer areas share one Firebase session, so this role flag is
 * what the AdminLayout and CustomerAuthGuard use to keep the two apart.
 */
const CustomerAuthListener = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(setAuthUser(null));
        return;
      }

      dispatch(setAuthUser({ uid: user.uid, email: user.email }));

      // Resolve the role first — guards wait on this before deciding.
      try {
        const snap = await getDoc(doc(db, "adminUsers", user.uid));
        dispatch(setIsAdmin(snap.exists() && snap.data()?.active === true));
      } catch {
        // A failed lookup must not grant admin access.
        dispatch(setIsAdmin(false));
      }

      dispatch(loadProfile(user.uid));
    });
    return () => unsub();
  }, [dispatch]);

  return null;
};

export default CustomerAuthListener;
