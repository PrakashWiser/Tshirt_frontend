export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Room {
  _id: string;
  roomName: string;
  slug: string;
  category: string;
  roomType: string;
  vendorId: string | null;
  locationId: string;
  subLocationId: string;
  description: string;
  mapLocation: {
    mapLink: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  stayType: "daily" | "hourly" | "both";
  starRating: number;

  pricing: {
    actualPrice: number;
    offerPrice: number;
    taxPercentage: number;
  };

  hourlyStay: {
    isAllowed: boolean;
    minimumHours: number;
    hourlyPrice: number;
  };

  capacity: {
    maxGuests: number;
    adults: number;
    children: number;
  };

  roomDetails: {
    bedrooms: number;
    beds: number;
    bathrooms: number;
    areaSqFt: number;
  };

  bookingSettings: {
    advancePayment: {
      isEnabled: boolean;
      type: "percentage" | "flat";
      value: number;
    };
    holdBooking: {
      isEnabled: boolean;
      holdMinutes: number;
    };
    paymentMode: "pay_at_property" | "full_payment" | "advance_payment";
    allowOfflineBooking: boolean;
    allowCancellation: boolean;
  };

  amenities: string[];
  features: string[];

  roomImages: string[];
  roomVideos: string[];

  checkInTime: string;
  checkOutTime: string;

  rating: {
    average: number;
    totalReviews: number;
  };

  policies: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    coupleFriendly: boolean;
    cancellationPolicy: string;
  };

  isFeatured: boolean;
  status: number;
  __v: number;
  createdAt: string;
  updatedAt: string;
  propertyId?: string | { _id: string; propertyName: string };
}

export interface Property {
  _id: string;
  propertyName: string;
  category: string;

  locationId: {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    subLocations?: any[];
  } | null;

  subLocationId?: string | null;
  vendorId?: string;
  description?: string;
  mapLocation?: any;
  starRating?: number;
  amenities?: string[];
  features?: string[];
  policies?: any;
  checkInTime?: string;
  checkOutTime?: string;
  isFeatured?: boolean;
  propertyImages?: string[];
  propertyVideos?: string[];
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingRule {
  _id: string;
  title: string;
  scope: "global" | "property" | "room";

  ruleType:
    | "day_of_week"
    | "date_range"
    | "weekend"
    | "seasonal"
    | "occupancy"
    | "last_minute"
    | "custom";

  adjustmentType: "percentage" | "fixed";

  operation: "increase" | "decrease";

  value: number;

  priority: number;

  isActive: boolean;

  daysOfWeek?: number[];

  propertyId?:
    | string
    | {
        _id: string;
        propertyName: string;
      }
    | null;

  locationId?: string | null;

  roomId?:
    | string
    | {
        _id: string;
        roomName: string;
      }
    | null;
  roomIds?: string[];

  startDate?: string | null;
  endDate?: string | null;

  isDeleted?: boolean;
  createdBy?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface RedisCacheMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CachedRoomPricing {
  actualPrice: number;
  offerPrice: number;
  taxPercentage: number;
}

export interface CachedRoomSubLocation {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isPopular?: boolean;
}

export interface CachedRoomLocation {
  _id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  image?: string;
  subLocations?: CachedRoomSubLocation[];
}

export interface CachedRoomProperty {
  _id: string;
  propertyName: string;
  slug: string;
  category: string;
  vendorId: string | null;
  locationId?: CachedRoomLocation;
  subLocationId?: string;
  address?: string;
  mapLink?: string;
  starRating?: number;
  amenities?: string[];
  features?: string[];
  propertyImages?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  policies?: {
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    coupleFriendly?: boolean;
    cancellationPolicy?: string;
  };
}

export interface CachedRoom {
  _id: string;
  roomName: string;
  slug: string;
  category: string;
  roomType: string;
  vendorId: string | null;
  locationId: string;
  subLocationId: string;
  description?: string;
  stayType: "daily" | "hourly" | "both";
  starRating?: number;
  amenities?: string[];
  features?: string[];
  roomImages?: string[];
  roomVideos?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  isFeatured?: boolean;
  status: number;
  pricing?: CachedRoomPricing;
  capacity?: {
    maxGuests: number;
    adults: number;
    children: number;
  };
  propertyId: CachedRoomProperty | string | null;
  displayPrice?: number;
  dynamicPricing?: {
    basePrice: number;
    finalPrice: number;
    appliedRules: unknown[];
  };
}

export interface RedisCacheEntry {
  key: string;
  data: {
    rooms: CachedRoom[];
    meta: RedisCacheMeta;
  };
}

export interface RedisCacheData {
  totalKeys: number;
  cache: RedisCacheEntry[];
}

export interface RedisCacheApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: RedisCacheData;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: number | string;
  createdAt: string;
  updatedAt: string;
}

export const CouponTriggerType = {
  ALL_USERS: "all_users",
  FIRST_BOOKING: "first_booking",
  FIRST_TIME_USER: "first_time_user",
  CHECKOUT_PAGE: "checkout_page",
  APP_ONLY: "app_only",
  ADMIN_BOOKING: "admin_booking",
  VENDOR_SPECIFIC: "vendor_specific",
  PROPERTY_SPECIFIC: "property_specific",
  ROOM_SPECIFIC: "room_specific",
  LOCATION_SPECIFIC: "location_specific",
  CATEGORY_SPECIFIC: "category_specific",
  MINIMUM_BOOKING_AMOUNT: "minimum_booking_amount",
  DATE_RANGE: "date_range",
  STAY_TYPE_DAILY: "stay_type_daily",
  STAY_TYPE_HOURLY: "stay_type_hourly",
  PAYMENT_METHOD: "payment_method",
  USER_SEGMENT: "user_segment",
  COUPON_CODE: "coupon_code",
} as const;

export type CouponTriggerType =
  (typeof CouponTriggerType)[keyof typeof CouponTriggerType];

export const TRIGGER_TYPE_LABELS: Record<CouponTriggerType, string> = {
  [CouponTriggerType.ALL_USERS]: "All Users",
  [CouponTriggerType.FIRST_BOOKING]: "First Booking",
  [CouponTriggerType.FIRST_TIME_USER]: "First Time User",
  [CouponTriggerType.CHECKOUT_PAGE]: "Checkout Page",
  [CouponTriggerType.APP_ONLY]: "App Only",
  [CouponTriggerType.ADMIN_BOOKING]: "Admin Booking",
  [CouponTriggerType.VENDOR_SPECIFIC]: "Vendor Specific",
  [CouponTriggerType.PROPERTY_SPECIFIC]: "Property Specific",
  [CouponTriggerType.ROOM_SPECIFIC]: "Room Specific",
  [CouponTriggerType.LOCATION_SPECIFIC]: "Location Specific",
  [CouponTriggerType.CATEGORY_SPECIFIC]: "Category Specific",
  [CouponTriggerType.MINIMUM_BOOKING_AMOUNT]: "Minimum Booking Amount",
  [CouponTriggerType.DATE_RANGE]: "Date Range",
  [CouponTriggerType.STAY_TYPE_DAILY]: "Stay Type - Daily",
  [CouponTriggerType.STAY_TYPE_HOURLY]: "Stay Type - Hourly",
  [CouponTriggerType.PAYMENT_METHOD]: "Payment Method",
  [CouponTriggerType.USER_SEGMENT]: "User Segment",
  [CouponTriggerType.COUPON_CODE]: "Coupon Code",
};

export const getTriggerTypeOptions = () => {
  return Object.values(CouponTriggerType).map((value) => ({
    label: TRIGGER_TYPE_LABELS[value],
    value,
  }));
};

export interface CouponValidationResult {
  valid: boolean;
  discount?: number;
  message?: string;
  couponCode?: string;
}

export interface Coupon {
  _id: string;
  title: string;
  code: string;
  description?: string;
  triggerType: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscountAmount?: number;
  minimumBookingAmount?: number;
  validFrom: string;
  validUntil: string;
  perUserUsageLimit: number;
  firstBookingOnly: boolean;
  showOnListing: boolean;
  status: number;
  usedCount?: number;
  isActive?: boolean;
  applicableSources: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateCouponPayload = Omit<
  Coupon,
  "_id" | "createdAt" | "updatedAt"
>;
