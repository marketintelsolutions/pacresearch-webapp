import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { callSendPasswordResetLink } from "../firebase/functions";
import { Customer, Organization } from "../types";

interface AuthUser {
  uid: string;
  email: string | null;
}

interface CustomerAuthState {
  user: AuthUser | null;
  profile: Customer | null;
  organization: Organization | null;
  authReady: boolean; // onAuthStateChanged has fired at least once
  /** null = still resolving the role; true = active adminUsers doc exists. */
  isAdmin: boolean | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerAuthState = {
  user: null,
  profile: null,
  organization: null,
  authReady: false,
  isAdmin: null,
  loading: false,
  error: null,
};

const nowIso = () => new Date().toISOString();

// ---- signup: individual -----------------------------------------------------
export const signUpIndividual = createAsyncThunk(
  "customerAuth/signUpIndividual",
  async (
    data: {
      email: string;
      password: string;
      name: string;
      phone: string;
      location: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(cred.user, { displayName: data.name });

      const profile: Customer = {
        uid: cred.user.uid,
        type: "individual",
        email: data.email,
        name: data.name,
        phone: data.phone,
        location: data.location,
        organizationId: null,
        status: "active",
        purchasedReportIds: [],
        totalSpend: 0,
        createdAt: nowIso(),
      };
      await setDoc(doc(db, "customers", cred.user.uid), {
        ...profile,
        lastLoginAt: serverTimestamp(),
      });
      return profile;
    } catch (err) {
      return rejectWithValue(authErrorMessage(err));
    }
  }
);

// ---- signup: corporate (creates the organization) ---------------------------
export const signUpCorporate = createAsyncThunk(
  "customerAuth/signUpCorporate",
  async (
    data: {
      email: string;
      password: string;
      name: string; // contact person
      phone: string;
      orgName: string;
      industry: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(cred.user, { displayName: data.name });

      const orgId = `org_${Date.now()}`;
      const organization: Organization = {
        id: orgId,
        orgName: data.orgName,
        industry: data.industry,
        primaryContactUid: cred.user.uid,
        memberUids: [cred.user.uid],
        seatLimit: 3, // included seats; DEFAULT_INCLUDED_SEATS
        createdAt: nowIso(),
      };
      await setDoc(doc(db, "organizations", orgId), organization);

      const profile: Customer = {
        uid: cred.user.uid,
        type: "corporate",
        email: data.email,
        name: data.name,
        phone: data.phone,
        location: "",
        organizationId: orgId,
        status: "active",
        purchasedReportIds: [],
        totalSpend: 0,
        createdAt: nowIso(),
      };
      await setDoc(doc(db, "customers", cred.user.uid), {
        ...profile,
        lastLoginAt: serverTimestamp(),
      });
      return { profile, organization };
    } catch (err) {
      return rejectWithValue(authErrorMessage(err));
    }
  }
);

// ---- login ------------------------------------------------------------------
export const loginCustomer = createAsyncThunk(
  "customerAuth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      // Best-effort last-login stamp (allowed: own customer doc).
      await setDoc(
        doc(db, "customers", cred.user.uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      ).catch(() => {});
      return { uid: cred.user.uid, email: cred.user.email };
    } catch (err) {
      return rejectWithValue(authErrorMessage(err));
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  "customerAuth/logout",
  async () => {
    await signOut(auth);
  }
);

export const resetPassword = createAsyncThunk(
  "customerAuth/resetPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      // Sent through our own provider (branded) rather than Firebase's
      // default noreply@<project>.firebaseapp.com sender.
      await callSendPasswordResetLink({ email });
      return true;
    } catch (err) {
      return rejectWithValue(authErrorMessage(err));
    }
  }
);

// ---- update own profile details --------------------------------------------
export const updateMyProfile = createAsyncThunk(
  "customerAuth/updateMyProfile",
  async (
    data: { name: string; phone: string; location: string },
    { rejectWithValue }
  ) => {
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Not signed in");
      // Self-update is allowed by the customers/{uid} security rule.
      await setDoc(
        doc(db, "customers", current.uid),
        {
          name: data.name,
          phone: data.phone,
          location: data.location,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await updateProfile(current, { displayName: data.name });
      return data;
    } catch (err) {
      return rejectWithValue(authErrorMessage(err));
    }
  }
);

// ---- load profile (+ organization) for the current user ---------------------
export const loadProfile = createAsyncThunk(
  "customerAuth/loadProfile",
  async (uid: string, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(db, "customers", uid));
      if (!snap.exists()) return { profile: null, organization: null };
      const profile = { uid, ...snap.data() } as Customer;

      let organization: Organization | null = null;
      if (profile.organizationId) {
        const orgSnap = await getDoc(
          doc(db, "organizations", profile.organizationId)
        );
        if (orgSnap.exists()) {
          organization = { id: orgSnap.id, ...orgSnap.data() } as Organization;
        }
      }
      return { profile, organization };
    } catch (err) {
      return rejectWithValue("Failed to load your profile");
    }
  }
);

function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.authReady = true;
      if (!action.payload) {
        state.profile = null;
        state.organization = null;
        state.isAdmin = false; // signed out — definitively not an admin
      } else {
        state.isAdmin = null; // resolving via adminUsers lookup
      }
    },
    setIsAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: CustomerAuthState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (
      state: CustomerAuthState,
      action: { payload: unknown }
    ) => {
      state.loading = false;
      state.error = (action.payload as string) || "Something went wrong.";
    };

    builder.addCase(signUpIndividual.pending, pending);
    builder.addCase(signUpIndividual.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.user = { uid: action.payload.uid, email: action.payload.email };
    });
    builder.addCase(signUpIndividual.rejected, rejected);

    builder.addCase(signUpCorporate.pending, pending);
    builder.addCase(signUpCorporate.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload.profile;
      state.organization = action.payload.organization;
      state.user = {
        uid: action.payload.profile.uid,
        email: action.payload.profile.email,
      };
    });
    builder.addCase(signUpCorporate.rejected, rejected);

    builder.addCase(loginCustomer.pending, pending);
    builder.addCase(loginCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(loginCustomer.rejected, rejected);

    builder.addCase(logoutCustomer.fulfilled, (state) => {
      state.user = null;
      state.profile = null;
      state.organization = null;
      state.isAdmin = false;
    });

    builder.addCase(loadProfile.fulfilled, (state, action) => {
      state.profile = action.payload.profile;
      state.organization = action.payload.organization;
    });

    builder.addCase(updateMyProfile.pending, pending);
    builder.addCase(updateMyProfile.fulfilled, (state, action) => {
      state.loading = false;
      if (state.profile) {
        state.profile = {
          ...state.profile,
          name: action.payload.name,
          phone: action.payload.phone,
          location: action.payload.location,
        };
      }
    });
    builder.addCase(updateMyProfile.rejected, rejected);

    builder.addCase(resetPassword.rejected, rejected);
  },
});

export const { setAuthUser, setIsAdmin, clearAuthError } =
  customerAuthSlice.actions;
export default customerAuthSlice.reducer;
