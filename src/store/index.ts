import { configureStore } from "@reduxjs/toolkit";
import resourcesReducer from "./resourcesSlice";

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
