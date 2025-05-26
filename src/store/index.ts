import { configureStore } from "@reduxjs/toolkit";
import resourcesReducer from "./resourcesSlice";
import equityMarketReducer from "./equityMarketSlice";

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    equityMarket: equityMarketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
