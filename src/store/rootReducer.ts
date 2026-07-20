import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import uiReducer from "./slice/uiSlice";
import locationReducer from "./slice/locationSlice";
import roomReducer from "./slice/roomSlice";
import propertyReducer from "./slice/propertySlice";
import pricingRuleReducer from "./slice/pricingRuleSlice";
import bookingReducer from "./slice/bookingSlice";
import publicRoomReducer from "./slice/publicRoomSlice";
import couponReducer from "./slice/couponSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  locations: locationReducer,
  rooms: roomReducer,
  property: propertyReducer,
  pricingRule: pricingRuleReducer,
  booking: bookingReducer,
  publicRoom: publicRoomReducer,
  coupon: couponReducer,
});

export default rootReducer;
