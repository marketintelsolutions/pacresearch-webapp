import { configureStore } from "@reduxjs/toolkit";
import resourcesReducer from "./resourcesSlice";
import equityMarketReducer from "./equityMarketSlice";
import reportsAdminReducer from "./reportsAdminSlice";
import reportArchiveReducer from "./reportArchiveSlice";
import customerAuthReducer from "./customerAuthSlice";
import purchasesReducer from "./purchasesSlice";
import adminManageReducer from "./adminManageSlice";

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    equityMarket: equityMarketReducer,
    reportsAdmin: reportsAdminReducer,
    reportArchive: reportArchiveReducer,
    customerAuth: customerAuthReducer,
    purchases: purchasesReducer,
    adminManage: adminManageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
