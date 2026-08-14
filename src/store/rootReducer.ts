import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import uiReducer from "./slice/uiSlice";
import pricingRuleReducer from "./slice/pricingRuleSlice";
import bookingReducer from "./slice/bookingSlice";
import couponReducer from "./slice/couponSlice";
import vendorReducer from "./slice/vendorSlice";
import premiumAmenitiesReducer from "./slice/premiumAmenitySlice";
import propertyTypeReducer from "./slice/propertyTypeSlice";
import propertyActionReducer from "./slice/propertyActionSlice";
import propertyReducer from "./slice/propertySlice";
import bhkReducer from "./slice/bhkSlice";
import enquiryReducer from "./slice/enquirySlice";
import lifestyleReducer from "./slice/lifestyleSlice";
import scheduleVisitReducer from "./slice/scheduleVisitSlice";
import notificationReducer from "./slice/notificationSlice";
import usersReducer from "./slice/usersSlice";
import statsReducer from "./slice/statsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  pricingRule: pricingRuleReducer,
  booking: bookingReducer,
  coupon: couponReducer,
  vendor: vendorReducer,
  premiumAmenities: premiumAmenitiesReducer,
  property: propertyReducer,
  propertyType: propertyTypeReducer,
  propertyAction: propertyActionReducer,
  enquiry: enquiryReducer,
  bhk: bhkReducer,
  lifestyle: lifestyleReducer,
  scheduleVisit: scheduleVisitReducer,
  notifications: notificationReducer,
  users: usersReducer,
  stats: statsReducer,
});

export default rootReducer;
