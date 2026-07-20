import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Check, Plus, Trash2, Tag, MessageSquare, Loader2, Wallet, Landmark, Clock, CalendarDays,
} from 'lucide-react';
import { getPublicRooms, clearPublicRoomError } from '../../store/slice/publicRoomSlice';
import { createBooking } from '../../store/slice/bookingSlice';
import type { RootState, AppDispatch } from '../../store/store';
import SelectField from '../../components/SelectField';
import InputField from '../../components/CommonInput';
import { useAppSelector } from '../../hooks/hooks';
import { getAllLocations } from '../../store/slice/locationSlice';
import CustomImage from '../../components/Image';
import { addToast } from '../../store/slice/uiSlice';

export const PAYMENT_TYPE = {
    FULL_PAYMENT: 'full_payment',
    ADVANCE_PAYMENT: 'advance_payment',
    PAY_AT_PROPERTY: 'pay_at_property',
} as const;

export type PaymentType = typeof PAYMENT_TYPE[keyof typeof PAYMENT_TYPE];

export const STAY_TYPE = {
    DAILY: 'daily',
    HOURLY: 'hourly',
} as const;

export type StayType = typeof STAY_TYPE[keyof typeof STAY_TYPE];

type Gender = 'male' | 'female' | 'other';
type PaymentMode = 'online' | 'offline';
type OfflinePaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'cheque' | '';

interface Guest {
    name: string;
    age: number;
    gender: Gender;
    mobile: string;
    email: string;
    address: string;
    isPrimary: boolean;
}

interface GuestPayload {
    name: string;
    age: number;
    gender: Gender;
    mobile: string;
    email?: string;
    address: string;
    isPrimary: boolean;
}

interface SearchFilters {
    location: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
}

interface CustomerPayload {
    name: string;
    mobile: string;
    email: string;
    address: string;
}

interface DailyBookingPayload {
    roomId: string;
    stayType: 'daily';
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    customer: CustomerPayload;
    guests: GuestPayload[];
    paymentMode: PaymentMode;
    paymentType: PaymentType;
    advanceAmount: number;
    offlinePaymentMethod: OfflinePaymentMethod;
    referenceNo: string;
    paymentNote: string;
    specialRequests: string;
    couponCode?: string;
}

interface HourlyBookingPayload {
    roomId: string;
    stayType: 'hourly';
    checkInDate: string;
    checkInTime: string;
    checkOutTime: string;
    totalHours: number;
    adults: number;
    children: number;
    customer: CustomerPayload;
    guests: GuestPayload[];
    paymentMode: PaymentMode;
    paymentType: PaymentType;
    advanceAmount: number;
    offlinePaymentMethod: OfflinePaymentMethod;
    referenceNo: string;
    paymentNote: string;
    specialRequests: string;
    couponCode?: string;
}

type BookingPayload = DailyBookingPayload | HourlyBookingPayload;

const GENDER_OPTIONS = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
];

const OFFLINE_METHOD_OPTIONS: { label: string; value: OfflinePaymentMethod }[] = [
    { label: 'Cash', value: 'cash' },
    { label: 'UPI', value: 'upi' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Card', value: 'card' },
    { label: 'Cheque', value: 'cheque' },
];

const createEmptyGuest = (isPrimary: boolean): Guest => ({
    name: '',
    age: 25,
    gender: 'male',
    mobile: '',
    email: '',
    address: '',
    isPrimary,
});

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toGuestPayload = (guest: Guest): GuestPayload => {
    const { email, ...rest } = guest;
    return email.trim() ? { ...rest, email: email.trim() } : { ...rest };
};

const calculateHours = (checkInTime: string, checkOutTime: string): number => {
    const [inH, inM] = checkInTime.split(':').map(Number);
    const [outH, outM] = checkOutTime.split(':').map(Number);
    const minutes = (outH * 60 + outM) - (inH * 60 + inM);
    return minutes > 0 ? Math.round((minutes / 60) * 100) / 100 : 0;
};

const BookingPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { rooms, isLoading: roomsLoading, error: roomsError } = useSelector(
        (state: RootState) => state.publicRoom
    );
    const { isLoading: bookingLoading } = useSelector(
        (state: RootState) => state.booking
    );

    const { locations } = useAppSelector((state) => state.locations);

    useEffect(() => {
        dispatch(getAllLocations());
    }, [dispatch]);

    const [step, setStep] = useState<1 | 2>(1);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [stayType, setStayType] = useState<StayType>(STAY_TYPE.DAILY);
    const [filters, setFilters] = useState<SearchFilters>({
        location: '',
        checkIn: today.toISOString().split('T')[0],
        checkOut: tomorrow.toISOString().split('T')[0],
        adults: 2,
        children: 0,
    });

    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [checkInTime, setCheckInTime] = useState('10:00');
    const [checkOutTime, setCheckOutTime] = useState('15:00');
    const [couponCode, setCouponCode] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [guests, setGuests] = useState<Guest[]>([createEmptyGuest(true)]);

    const [paymentMode, setPaymentMode] = useState<PaymentMode>('offline');
    const [paymentType, setPaymentType] = useState<PaymentType>(PAYMENT_TYPE.ADVANCE_PAYMENT);
    const [offlinePaymentMethod, setOfflinePaymentMethod] = useState<OfflinePaymentMethod>('cash');
    const [referenceNo, setReferenceNo] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    const selectedRoom = useMemo(
        () => rooms.find((room: any) => room._id === selectedRoomId) ?? null,
        [rooms, selectedRoomId]
    );

    const totalHours = useMemo(() => {
        if (stayType !== STAY_TYPE.HOURLY) return 0;
        return calculateHours(checkInTime, checkOutTime);
    }, [stayType, checkInTime, checkOutTime]);

    const totalDays = useMemo(() => {
        if (stayType !== STAY_TYPE.DAILY || !filters.checkIn || !filters.checkOut) return 1;
        const diff = new Date(filters.checkOut).getTime() - new Date(filters.checkIn).getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [stayType, filters.checkIn, filters.checkOut]);

    const pricing = useMemo(() => {
        if (!selectedRoom) return { base: 0, tax: 0, total: 0 };
        const unitPrice =
            (selectedRoom as any)?.displayPrice ??
            (selectedRoom as any)?.dynamicPricing?.finalPrice ??
            (selectedRoom as any)?.pricing?.offerPrice ??
            0;
        const basePrice = stayType === STAY_TYPE.HOURLY
            ? Math.round((unitPrice / 24) * totalHours)
            : unitPrice * totalDays;
        const taxPercentage = selectedRoom.pricing?.taxPercentage || 18;
        const tax = Math.round(basePrice * (taxPercentage / 100));

        return { base: basePrice, tax, total: basePrice + tax };
    }, [selectedRoom, stayType, totalHours, totalDays]);

    const payableNow = useMemo(() => {
        if (paymentType === PAYMENT_TYPE.FULL_PAYMENT) return pricing.total;
        if (paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY) return 0;
        const parsed = Number(advanceAmount);
        return Number.isFinite(parsed) ? parsed : 0;
    }, [paymentType, advanceAmount, pricing.total]);

    const dueAmount = Math.max(pricing.total - payableNow, 0);

    useEffect(() => {
        if (paymentType !== PAYMENT_TYPE.ADVANCE_PAYMENT) setAdvanceAmount('');
    }, [paymentType]);

    const handleSearch = async () => {
        if (!filters.location) {
            setFormError('Please select a location');
            return;
        }
        if (!filters.checkIn) {
            setFormError('Please select a check-in date');
            return;
        }
        if (stayType === STAY_TYPE.DAILY) {
            if (!filters.checkOut) {
                setFormError('Please select a check-out date');
                return;
            }
            if (new Date(filters.checkOut) <= new Date(filters.checkIn)) {
                setFormError('Check-out date must be after check-in date');
                return;
            }
        }
        if (filters.adults < 1) {
            setFormError('At least 1 adult is required');
            return;
        }
        setFormError(null);

        const result = await dispatch(
            getPublicRooms({
                location: filters.location,
                checkIn: filters.checkIn,
                checkOut: stayType === STAY_TYPE.DAILY ? filters.checkOut : filters.checkIn,
                adults: filters.adults,
                children: filters.children,
            })
        );
        if (getPublicRooms.fulfilled.match(result)) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setSelectedRoomId('');
        setFormError(null);
        dispatch(clearPublicRoomError());
    };

    const handleGuestChange = (index: number, field: keyof Guest, value: string | number) => {
        setGuests((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
    };

    const addGuest = () => setGuests((prev) => [...prev, createEmptyGuest(false)]);

    const removeGuest = (index: number) => {
        if (guests.length <= 1) return;
        setGuests((prev) => prev.filter((_, i) => i !== index));
    };

    const validateGuests = (): string | null => {
        const primaryGuest = guests.find((g) => g.isPrimary) || guests[0];
        if (!primaryGuest?.name.trim()) return 'Primary guest name is required';
        if (!MOBILE_REGEX.test(primaryGuest.mobile.trim())) return 'Enter a valid 10-digit mobile number';
        if (!EMAIL_REGEX.test(primaryGuest.email.trim())) return 'Enter a valid email address';
        if (!primaryGuest?.address.trim()) return 'Primary guest address is required';

        for (const g of guests) {
            if (g.age < 0 || g.age > 120) return 'Guest age must be between 0 and 120';
            if (g.email.trim() && !EMAIL_REGEX.test(g.email.trim())) return 'One or more guest emails are invalid';
        }
        return null;
    };

    const validateRoomAndStay = (): string | null => {
        if (!selectedRoomId) return 'Please select a room';
        if (stayType === STAY_TYPE.HOURLY) {
            if (!checkInTime || !checkOutTime) return 'Please select check-in and check-out times';
            if (totalHours <= 0) return 'Check-out time must be after check-in time';
        }
        return null;
    };

    const validatePayment = (): string | null => {
        if (paymentMode !== 'offline') return null;
        if (paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY) return null;

        if (!offlinePaymentMethod) return 'Please select a payment method';
        if (!referenceNo.trim()) return 'Please enter a reference / transaction number';
        if (referenceNo.trim().length < 4) return 'Reference number looks too short';
        if (paymentType === PAYMENT_TYPE.ADVANCE_PAYMENT) {
            const amount = Number(advanceAmount);
            if (!advanceAmount || !Number.isFinite(amount) || amount <= 0) {
                return 'Please enter a valid advance amount';
            }
            if (amount > pricing.total) return 'Advance amount cannot exceed the total amount';
        }
        return null;
    };

    const runValidation = (): string | null =>
        validateRoomAndStay() || validateGuests() || validatePayment();

    const buildPayload = (primaryGuest: Guest): BookingPayload => {
        const resolvedAdvanceAmount =
            paymentType === PAYMENT_TYPE.FULL_PAYMENT ? pricing.total :
                paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY ? 0 :
                    Number(advanceAmount) || 0;

        const resolvedOfflineMethod = paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY ? '' : offlinePaymentMethod;
        const resolvedReferenceNo = paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY ? '' : referenceNo;
        const resolvedPaymentNote = paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY ? '' : paymentNote;

        const base = {
            roomId: selectedRoomId,
            adults: filters.adults,
            children: filters.children,
            customer: {
                name: primaryGuest.name,
                mobile: primaryGuest.mobile,
                email: primaryGuest.email,
                address: primaryGuest.address,
            },
            guests: guests.map(toGuestPayload),
            paymentMode,
            paymentType,
            advanceAmount: resolvedAdvanceAmount,
            offlinePaymentMethod: resolvedOfflineMethod,
            referenceNo: resolvedReferenceNo,
            paymentNote: resolvedPaymentNote,
            specialRequests,
            ...(couponCode ? { couponCode } : {}),
        };

        if (stayType === STAY_TYPE.HOURLY) {
            return {
                ...base,
                stayType: 'hourly',
                checkInDate: filters.checkIn,
                checkInTime,
                checkOutTime,
                totalHours,
            };
        }

        return {
            ...base,
            stayType: 'daily',
            checkInDate: filters.checkIn,
            checkOutDate: filters.checkOut,
        };
    };



    const handleConfirm = async () => {
        const error = runValidation();
        if (error) {
            setFormError(error);
            return;
        }
        setFormError(null);

        const primaryGuest = guests.find((g) => g.isPrimary) || guests[0];
        const payload = buildPayload(primaryGuest);

        const result = await dispatch(createBooking(payload));
        if (createBooking.rejected.match(result)) {
            const message =
                (result.payload as any)?.message ||
                (result.error as any)?.message ||
                'Failed to create booking';
            setFormError(message);
        }
    };

    useEffect(() => {
        if (!formError) return;
        dispatch(
            addToast({
                type: "error",
                text: formError,
            })
        );
    }, [formError, dispatch]);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-center gap-6">
                    {[
                        { id: 1, label: 'Search Stay' },
                        { id: 2, label: 'Booking Details' },
                    ].map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${step >= s.id ? 'bg-black text-white shadow-md shadow-black/30' : 'bg-slate-200 text-slate-500'
                                        }`}
                                >
                                    {step > s.id ? <Check size={16} /> : s.id}
                                </div>
                                <span className={`hidden text-sm font-medium sm:block ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx === 0 && (
                                <div className="h-[2px] w-16 rounded-full bg-slate-200 sm:w-24">
                                    <div
                                        className="h-full rounded-full bg-black transition-all duration-300"
                                        style={{ width: step > 1 ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                            className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
                        >
                            <h2 className="text-lg font-semibold text-slate-900">Find Your Stay</h2>
                            <p className="mt-1 text-sm text-slate-500">Search available rooms by location and dates</p>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStayType(STAY_TYPE.DAILY)}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition ${stayType === STAY_TYPE.DAILY
                                        ? 'border-black bg-black text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                        }`}
                                >
                                    <CalendarDays size={14} /> Daily
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStayType(STAY_TYPE.HOURLY)}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition ${stayType === STAY_TYPE.HOURLY
                                        ? 'border-black bg-black text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                        }`}
                                >
                                    <Clock size={14} /> Hourly
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
                                    <SelectField
                                        value={filters.location}
                                        onChange={(value) =>
                                            setFilters((prev) => ({ ...prev, location: String(value) }))
                                        }
                                        options={locations.map((location: any) => ({
                                            label: location.name,
                                            value: location.name,
                                        }))}
                                        placeholder="Select Location"
                                        searchable
                                        className="pl-10 rounded-md border border-slate-200 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {stayType === STAY_TYPE.DAILY ? (
                                    <>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Check In</label>
                                            <InputField
                                                type="date"
                                                value={filters.checkIn}
                                                onChange={(e: any) => setFilters((p) => ({ ...p, checkIn: e.target.value }))}
                                                className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Check Out</label>
                                            <InputField
                                                type="date"
                                                value={filters.checkOut}
                                                onChange={(e: any) => setFilters((p) => ({ ...p, checkOut: e.target.value }))}
                                                className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                                            <InputField
                                                type="date"
                                                value={filters.checkIn}
                                                onChange={(e: any) => setFilters((p) => ({ ...p, checkIn: e.target.value }))}
                                                className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">From</label>
                                                <InputField
                                                    type="time"
                                                    value={checkInTime}
                                                    onChange={(e: any) => setCheckInTime(e.target.value)}
                                                    className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">To</label>
                                                <InputField
                                                    type="time"
                                                    value={checkOutTime}
                                                    onChange={(e: any) => setCheckOutTime(e.target.value)}
                                                    className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Adults</label>
                                    <InputField
                                        type="number"
                                        value={filters.adults}
                                        onChange={(e: any) => setFilters((p) => ({ ...p, adults: Number(e.target.value) }))}
                                        className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Children</label>
                                    <InputField
                                        type="number"
                                        value={filters.children}
                                        onChange={(e: any) => setFilters((p) => ({ ...p, children: Number(e.target.value) }))}
                                        className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {roomsError && (
                                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {roomsError}
                                </div>
                            )}

                            <button
                                onClick={handleSearch}
                                disabled={roomsLoading}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-black to-gray-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:shadow-black/40 disabled:opacity-60"
                            >
                                {roomsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {roomsLoading ? 'Searching…' : 'Search Available Rooms'}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="booking"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]"
                        >
                            <div>
                                <button
                                    onClick={handleBack}
                                    className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                                >
                                    <ChevronLeft size={16} /> Back to Search
                                </button>
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Select Room
                                    </label>

                                    {roomsLoading ? (
                                        <div className="py-3 text-sm text-slate-500">Loading rooms...</div>
                                    ) : rooms.length === 0 ? (
                                        <div className="py-3 text-sm text-slate-500">
                                            No rooms available for the selected dates.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedRoomId}
                                            onChange={(e) => setSelectedRoomId(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">Select a Room</option>

                                            {rooms.map((room: any) => {
                                                const price =
                                                    room.displayPrice ||
                                                    room.dynamicPricing?.finalPrice ||
                                                    room.pricing?.offerPrice ||
                                                    0;

                                                return (
                                                    <option key={room._id} value={room._id}>
                                                        {room.roomName} - ₹{price.toLocaleString('en-IN')} / night
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                </div>

                                {stayType === STAY_TYPE.HOURLY && (
                                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-900">Stay Duration</h3>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Check-in Time</label>
                                                <InputField
                                                    type="time"
                                                    value={checkInTime}
                                                    onChange={(e: any) => setCheckInTime(e.target.value)}
                                                    className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Check-out Time</label>
                                                <InputField
                                                    type="time"
                                                    value={checkOutTime}
                                                    onChange={(e: any) => setCheckOutTime(e.target.value)}
                                                    className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">{totalHours} hour(s) selected</p>
                                    </div>
                                )}

                                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-900">Additional Details</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                                <Tag size={14} /> Coupon Code
                                            </label>
                                            <InputField
                                                type="text"
                                                placeholder="Optional"
                                                value={couponCode}
                                                onChange={(e: any) => setCouponCode(e.target.value)}
                                                className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                                <MessageSquare size={14} /> Special Requests
                                            </label>
                                            <textarea
                                                value={specialRequests}
                                                onChange={(e) => setSpecialRequests(e.target.value)}
                                                rows={3}
                                                placeholder="Any special requests..."
                                                className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-900">Guest Details</h3>
                                        <button
                                            type="button"
                                            onClick={addGuest}
                                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                        >
                                            <Plus size={14} /> Add Guest
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        {guests.map((guest, index) => (
                                            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-slate-600">
                                                        Guest {index + 1} {guest.isPrimary && <span className="text-blue-600">(Primary)</span>}
                                                    </span>
                                                    {!guest.isPrimary && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGuest(index)}
                                                            className="text-slate-400 transition hover:text-red-500"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <InputField
                                                            type="text"
                                                            placeholder="Full Name"
                                                            value={guest.name}
                                                            onChange={(e: any) => handleGuestChange(index, 'name', e.target.value)}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputField
                                                            type="email"
                                                            placeholder="Email"
                                                            value={guest.email}
                                                            onChange={(e: any) => handleGuestChange(index, 'email', e.target.value)}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputField
                                                            type="tel"
                                                            placeholder="Mobile"
                                                            value={guest.mobile}
                                                            onChange={(e: any) => handleGuestChange(index, 'mobile', e.target.value)}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputField
                                                            type="number"
                                                            placeholder="Age"
                                                            value={guest.age}
                                                            onChange={(e: any) => handleGuestChange(index, 'age', Number(e.target.value))}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <SelectField
                                                            value={guest.gender}
                                                            onChange={(value: any) => handleGuestChange(index, 'gender', value)}
                                                            options={GENDER_OPTIONS}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputField
                                                            type="text"
                                                            placeholder="Address"
                                                            value={guest.address}
                                                            onChange={(e: any) => handleGuestChange(index, 'address', e.target.value)}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-900">Payment Details</h3>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode('offline')}
                                            className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition ${paymentMode === 'offline'
                                                ? 'border-black bg-black text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                                }`}
                                        >
                                            <Wallet size={14} /> Offline
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentMode("online");
                                                setPaymentType(PAYMENT_TYPE.FULL_PAYMENT);
                                            }}
                                            className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition ${paymentMode === 'online'
                                                ? 'border-black bg-black text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                                }`}
                                        >
                                            <Landmark size={14} /> Razorpay
                                        </button>
                                    </div>

                                    {paymentMode === 'online' ? (
                                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                                            Customer will complete payment through Razorpay.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mt-4 grid grid-cols-3 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentType(PAYMENT_TYPE.ADVANCE_PAYMENT)}
                                                    className={`rounded-lg border-2 py-2.5 text-sm font-medium transition ${paymentType === PAYMENT_TYPE.ADVANCE_PAYMENT
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                                        }`}
                                                >
                                                    Advance
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentType(PAYMENT_TYPE.FULL_PAYMENT)}
                                                    className={`rounded-lg border-2 py-2.5 text-sm font-medium transition ${paymentType === PAYMENT_TYPE.FULL_PAYMENT
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                                        }`}
                                                >
                                                    Full Payment
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentType(PAYMENT_TYPE.PAY_AT_PROPERTY)}
                                                    className={`rounded-lg border-2 py-2.5 text-sm font-medium transition ${paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                                        }`}
                                                >
                                                    Pay at Property
                                                </button>
                                            </div>

                                            {paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY ? (
                                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                                    No payment collected now. Guest will pay the full amount at the property.
                                                </div>
                                            ) : (
                                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
                                                        <SelectField
                                                            value={offlinePaymentMethod}
                                                            onChange={(value: any) => setOfflinePaymentMethod(value)}
                                                            options={OFFLINE_METHOD_OPTIONS}
                                                            className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Reference / Transaction No</label>
                                                        <InputField
                                                            type="text"
                                                            placeholder="e.g. UPI-8823421"
                                                            value={referenceNo}
                                                            onChange={(e: any) => setReferenceNo(e.target.value)}
                                                            className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>

                                                    {paymentType === PAYMENT_TYPE.ADVANCE_PAYMENT && (
                                                        <div>
                                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Advance Amount</label>
                                                            <InputField
                                                                type="number"
                                                                placeholder="Enter amount"
                                                                value={advanceAmount}
                                                                onChange={(e: any) => setAdvanceAmount(e.target.value)}
                                                                className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className={paymentType === PAYMENT_TYPE.ADVANCE_PAYMENT ? '' : 'sm:col-span-2'}>
                                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Note (Optional)</label>
                                                        <InputField
                                                            type="text"
                                                            placeholder="e.g. Advance collected at checkin"
                                                            value={paymentNote}
                                                            onChange={(e: any) => setPaymentNote(e.target.value)}
                                                            className="w-full rounded-md border border-slate-200 py-3 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="lg:sticky lg:top-6 lg:h-fit">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
                                    <h3 className="text-sm font-semibold text-slate-900">Booking Summary</h3>

                                    {selectedRoom ? (
                                        <div className="mt-4 flex gap-3 rounded-md bg-slate-50 p-3">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                                                <CustomImage
                                                    src={selectedRoom.roomImages?.[0]}
                                                    alt={selectedRoom.roomName}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{selectedRoom.roomName}</p>
                                                <p className="text-xs text-slate-500 capitalize">{(selectedRoom as any)?.property?.category}</p>
                                                {selectedRoom.features?.length > 0 && (
                                                    <div className="my-1 flex flex-wrap gap-2">
                                                        {selectedRoom.features.map(
                                                            (feature: string, index: number) => (
                                                                <span
                                                                    key={index}
                                                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs text-black"
                                                                >
                                                                    {feature}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-slate-400">Select a room to see pricing</p>
                                    )}

                                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Stay Type</span>
                                            <span className="font-medium capitalize text-slate-900">{stayType}</span>
                                        </div>
                                        {stayType === STAY_TYPE.DAILY ? (
                                            <>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>Check-in</span>
                                                    <span className="font-medium text-slate-900">{filters.checkIn || '-'}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>Check-out</span>
                                                    <span className="font-medium text-slate-900">{filters.checkOut || '-'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>Date</span>
                                                    <span className="font-medium text-slate-900">{filters.checkIn || '-'}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>Time</span>
                                                    <span className="font-medium text-slate-900">{checkInTime} - {checkOutTime}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between text-slate-500">
                                            <span>Guests</span>
                                            <span className="font-medium text-slate-900">
                                                {filters.adults} Adults, {filters.children} Children
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Base Amount</span>
                                            <span>₹{pricing.base.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Tax ({selectedRoom?.pricing?.taxPercentage || 18}%)</span>
                                            <span>₹{pricing.tax.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                                            <span>Total</span>
                                            <span>₹{pricing.total.toLocaleString('en-IN')}</span>
                                        </div>
                                        {paymentMode === 'offline' && paymentType !== PAYMENT_TYPE.PAY_AT_PROPERTY && (
                                            <>
                                                <div className="flex justify-between text-emerald-600">
                                                    <span>Payable Now</span>
                                                    <span className="font-medium">₹{payableNow.toLocaleString('en-IN')}</span>
                                                </div>
                                                {paymentType === PAYMENT_TYPE.ADVANCE_PAYMENT && (
                                                    <div className="flex justify-between text-amber-600">
                                                        <span>Due Amount</span>
                                                        <span className="font-medium">₹{dueAmount.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {paymentMode === 'offline' && paymentType === PAYMENT_TYPE.PAY_AT_PROPERTY && (
                                            <div className="flex justify-between text-amber-600">
                                                <span>Due at Property</span>
                                                <span className="font-medium">₹{pricing.total.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 rounded-md border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={bookingLoading || !selectedRoomId}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-black py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-60"
                                        >
                                            {bookingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                            {bookingLoading ? 'Booking…' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default BookingPage;