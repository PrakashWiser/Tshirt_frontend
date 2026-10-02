import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import uiReducer from "./slice/uiSlice";
import couponReducer from "./slice/couponSlice";
import enquiryReducer from "./slice/enquirySlice";
import notificationReducer from "./slice/notificationSlice";
import usersReducer from "./slice/usersSlice";
import statsReducer from "./slice/statsSlice";
import getNotificationReducer from "./slice/getNotificationSlice";
import contactSupportReducer from "./slice/contactSupportSlice";
import parentCategoryReducer from "./slice/parentCategorySlice";
import subCategoryReducer from "./slice/subCategorySlice";
import bannerReducer from "./slice/bannerSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  coupon: couponReducer,
  enquiry: enquiryReducer,
  notifications: notificationReducer,
  users: usersReducer,
  stats: statsReducer,
  getNotifications: getNotificationReducer,
  contactSupport: contactSupportReducer,
  parentCategories: parentCategoryReducer,
  subCategories: subCategoryReducer,
  banner: bannerReducer,
});

export default rootReducer;
