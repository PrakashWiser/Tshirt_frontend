export const USE_MOCK_MODULE_DATA = false;

export const MOCK_ADMIN_USER = {
  _id: "admin_1",
  name: "Demo Admin",
  email: "admin@demo.com",
  role: "Super Admin",
  profilePhoto: "",
};

export const MOCK_LOGIN_RESPONSE = {
  success: true,
  statusCode: 200,
  message: "Login successful",
  data: {
    message: "Login successful",
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: MOCK_ADMIN_USER,
  },
};

export const MOCK_PROFILE_RESPONSE = {
  success: true,
  statusCode: 200,
  message: "Profile fetched successfully",
  data: MOCK_ADMIN_USER,
};

export const MOCK_STATS = {
  totalUsers: 128,
  totalProperties: 342,
  totalBookings: 96,
  totalRevenue: 2450000,
};

export const MOCK_USERS_RESPONSE = {
  users: [
    {
      _id: "user_1",
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav@demo.com",
      mobile: "9876543210",
      isVerified: true,
      status: 1,
      roles: ["Super Admin"],
      favourites: [],
      createdAt: "2025-01-10T00:00:00.000Z",
      updatedAt: "2025-01-12T00:00:00.000Z",
    },
    {
      _id: "user_2",
      firstName: "Meera",
      lastName: "Patel",
      email: "meera@demo.com",
      mobile: "9123456780",
      isVerified: true,
      status: 1,
      roles: ["Branch Manager"],
      favourites: [],
      createdAt: "2025-01-11T00:00:00.000Z",
      updatedAt: "2025-01-14T00:00:00.000Z",
    },
    {
      _id: "user_3",
      firstName: "Rohan",
      lastName: "Joshi",
      email: "rohan@demo.com",
      mobile: "9988776655",
      isVerified: false,
      status: 0,
      roles: ["Support Executive"],
      favourites: [],
      createdAt: "2025-02-01T00:00:00.000Z",
      updatedAt: "2025-02-02T00:00:00.000Z",
    },
  ],
  pagination: {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_PROPERTIES = {
  properties: [
    {
      _id: "prop_1",
      title: "Skyline Residency",
      slug: "skyline-residency",
      price: 6500000,
      bedrooms: 3,
      bathrooms: 2,
      status: "Active",
      city: "Mumbai",
      locality: "Andheri",
      propertyType: "Apartment",
      createdAt: "2025-02-10T00:00:00.000Z",
      updatedAt: "2025-02-15T00:00:00.000Z",
    },
    {
      _id: "prop_2",
      title: "Green Valley Villa",
      slug: "green-valley-villa",
      price: 9500000,
      bedrooms: 4,
      bathrooms: 3,
      status: "Active",
      city: "Pune",
      locality: "Kharadi",
      propertyType: "Villa",
      createdAt: "2025-02-18T00:00:00.000Z",
      updatedAt: "2025-02-25T00:00:00.000Z",
    },
    {
      _id: "prop_3",
      title: "City Heights",
      slug: "city-heights",
      price: 4200000,
      bedrooms: 2,
      bathrooms: 2,
      status: "Inactive",
      city: "Bengaluru",
      locality: "Koramangala",
      propertyType: "Apartment",
      createdAt: "2025-03-01T00:00:00.000Z",
      updatedAt: "2025-03-05T00:00:00.000Z",
    },
  ],
  pagination: {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_PROPERTY_TYPES = {
  propertyTypes: [
    {
      _id: "ptype_1",
      name: "Apartment",
      slug: "apartment",
      description: "Luxury apartments",
      icon: "building",
      status: "Active",
      sortOrder: 1,
      createdAt: "2025-02-01T00:00:00.000Z",
      updatedAt: "2025-02-02T00:00:00.000Z",
      __v: 0,
    },
    {
      _id: "ptype_2",
      name: "Villa",
      slug: "villa",
      description: "Premium villas",
      icon: "home",
      status: "Active",
      sortOrder: 2,
      createdAt: "2025-02-03T00:00:00.000Z",
      updatedAt: "2025-02-04T00:00:00.000Z",
      __v: 0,
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_BHKS = {
  bhks: [
    {
      _id: "bhk_1",
      name: "1 BHK",
      slug: "1-bhk",
      description: "One bedroom apartment",
      status: "Active",
      createdAt: "2025-02-01T00:00:00.000Z",
      updatedAt: "2025-02-01T00:00:00.000Z",
      __v: 0,
    },
    {
      _id: "bhk_2",
      name: "2 BHK",
      slug: "2-bhk",
      description: "Two bedroom apartment",
      status: "Active",
      createdAt: "2025-02-02T00:00:00.000Z",
      updatedAt: "2025-02-02T00:00:00.000Z",
      __v: 0,
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_LIFESTYLES = {
  lifestyles: [
    {
      _id: "life_1",
      name: "Luxury",
      slug: "luxury",
      description: "Premium lifestyle",
      image: "",
      status: "Active",
      createdAt: "2025-02-10T00:00:00.000Z",
      updatedAt: "2025-02-12T00:00:00.000Z",
      __v: 0,
    },
    {
      _id: "life_2",
      name: "Family Living",
      slug: "family-living",
      description: "Comfortable residential community",
      image: "",
      status: "Active",
      createdAt: "2025-02-11T00:00:00.000Z",
      updatedAt: "2025-02-13T00:00:00.000Z",
      __v: 0,
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_AMENITIES = {
  amenities: [
    {
      _id: "amenity_1",
      name: "Swimming Pool",
      slug: "swimming-pool",
      description: "Private pool access",
      icon: "waves",
      status: 1,
      createdBy: "admin_1",
      createdAt: "2025-02-10T00:00:00.000Z",
      updatedAt: "2025-02-12T00:00:00.000Z",
    },
    {
      _id: "amenity_2",
      name: "Gym",
      slug: "gym",
      description: "Fitness center",
      icon: "dumbbell",
      status: 1,
      createdBy: "admin_1",
      createdAt: "2025-02-11T00:00:00.000Z",
      updatedAt: "2025-02-13T00:00:00.000Z",
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_COUPONS = {
  coupons: [
    {
      _id: "coupon_1",
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      status: "Active",
      validFrom: "2025-01-01T00:00:00.000Z",
      validTo: "2025-12-31T00:00:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    pages: 1,
  },
};

export const MOCK_BOOKINGS = {
  bookings: [
    {
      _id: "booking_1",
      propertyId: "prop_1",
      customerName: "Riya Mehta",
      status: "Confirmed",
      totalAmount: 6500000,
      createdAt: "2025-03-20T12:00:00.000Z",
      updatedAt: "2025-03-21T12:00:00.000Z",
    },
  ],
  pagination: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_PRICING_RULES = {
  pricingRules: [
    {
      _id: "rule_1",
      name: "Weekend Special",
      description: "Discount for weekend bookings",
      status: "Active",
      createdAt: "2025-02-10T00:00:00.000Z",
      updatedAt: "2025-02-12T00:00:00.000Z",
    },
  ],
  pagination: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_VENDORS = {
  vendors: [
    {
      _id: "vendor_1",
      firstName: "Ankit",
      lastName: "Patel",
      email: "ankit@demo.com",
      mobile: "9876543321",
      status: "Active",
      isVerified: true,
      roles: ["Vendor"],
      createdAt: "2025-02-10T00:00:00.000Z",
      updatedAt: "2025-02-14T00:00:00.000Z",
    },
  ],
  pagination: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_NOTIFICATIONS = {
  notifications: [
    {
      _id: "n_1",
      propertyId: "prop_1",
      fullName: "Amit Shah",
      email: "amit@example.com",
      phone: "9876543212",
      status: "New",
      message: "Property tour request received",
      isRead: false,
      createdAt: "2025-03-20T10:00:00.000Z",
      updatedAt: "2025-03-20T10:00:00.000Z",
    },
    {
      _id: "n_2",
      propertyId: "prop_2",
      fullName: "Neha Roy",
      email: "neha@example.com",
      phone: "9123456781",
      status: "Read",
      message: "Payment confirmation received",
      isRead: true,
      createdAt: "2025-03-18T11:00:00.000Z",
      updatedAt: "2025-03-18T11:00:00.000Z",
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const MOCK_PROPERTY_ACTIONS = {
  propertyActions: [
    {
      _id: "propertyAction_1",
      name: "Featured Listing",
      slug: "featured-listing",
      isNew: true,
      description: "Highlight this property in top ads",
      icon: "star",
      color: "#f59e0b",
      image: "",
      sortOrder: 1,
      status: "Active",
      createdAt: "2025-02-10T00:00:00.000Z",
      updatedAt: "2025-02-12T00:00:00.000Z",
      __v: 0,
    },
    {
      _id: "propertyAction_2",
      name: "Hot Deal",
      slug: "hot-deal",
      isNew: false,
      description: "Promote discount campaign",
      icon: "tag",
      color: "#ef4444",
      image: "",
      sortOrder: 2,
      status: "Active",
      createdAt: "2025-02-11T00:00:00.000Z",
      updatedAt: "2025-02-13T00:00:00.000Z",
      __v: 0,
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};
