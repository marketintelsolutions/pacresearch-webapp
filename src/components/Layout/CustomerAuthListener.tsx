import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAppDispatch } from "../../hooks/redux";
import { setAuthUser, loadProfile } from "../../store/customerAuthSlice";

/**
 * Mounted once at the app root. Keeps the customerAuth slice in sync with
 * Firebase Auth and loads the customer profile whenever a user is present.
 */
const CustomerAuthListener = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setAuthUser({ uid: user.uid, email: user.email }));
        dispatch(loadProfile(user.uid));
      } else {
        dispatch(setAuthUser(null));
      }
    });
    return () => unsub();
  }, [dispatch]);

  return null;
};

export default CustomerAuthListener;
