"use client";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
} from "react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentProps {
    totalAmount: number;
    disabled?: boolean;
    userData?: {
        firstName?: string;
        email?: string;
        mobile?: string;
    };
    dispatch: any;
    verifyPayment: any;
    navigate: (path: string) => void;
    errorAlert: (message: string) => void;
}

export interface PaymentRef {
    initiatePayment: (razorpayOrderId: string) => Promise<void>;
}

const Payment = forwardRef<PaymentRef, PaymentProps>(
    (
        {
            totalAmount,
            userData,
            dispatch,
            verifyPayment,
            navigate,
            errorAlert,
        },
        ref
    ) => {
        useEffect(() => {
            if (!window.Razorpay) {
                const script = document.createElement("script");

                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";

                script.async = true;

                script.onload = () => {
                    console.log(
                        "Razorpay SDK loaded successfully"
                    );
                };

                script.onerror = () => {
                    console.log(
                        "Failed to load Razorpay SDK"
                    );
                };

                document.body.appendChild(script);
            } else {
                console.log(
                    "Razorpay SDK already loaded"
                );
            }
        }, []);

        const initiatePayment = async (
            razorpayOrderId: string
        ): Promise<void> => {
            if (!razorpayOrderId) {
                return errorAlert("Invalid order ID");
            }

            try {
                const options = {
                    key: import.meta.env.BASE_URL,
                    amount: totalAmount * 100,
                    currency: "INR",
                    name: "Nanmai",
                    description: "Payment for your order",
                    order_id: razorpayOrderId,

                    theme: {
                        color: "#0C8040",
                    },

                    method: {
                        upi: true,
                        card: true,
                        netbanking: true,
                        wallet: true,
                    },

                    handler: async (response: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) => {
                        const verifyPayload = {
                            razorpayOrderId:
                                response.razorpay_order_id,

                            razorpayPaymentId:
                                response.razorpay_payment_id,

                            razorpaySignature:
                                response.razorpay_signature,
                        };

                        try {
                            await dispatch(
                                verifyPayment(verifyPayload)
                            );

                            setTimeout(() => {
                                navigate("/cart");
                            }, 300);
                        } catch (err) {
                            console.error(
                                "Verification error:",
                                err
                            );
                        }
                    },

                    prefill: {
                        name: userData?.firstName,
                        email: userData?.email,
                        contact: userData?.mobile,
                    },
                };

                const razor = new window.Razorpay(
                    options
                );

                razor.on(
                    "payment.failed",
                    (response: any) => {
                        errorAlert(
                            response.error.description ||
                            "Payment failed"
                        );
                    }
                );

                razor.open();
            } catch (err) {
                console.error(err);

                errorAlert(
                    "Payment error occurred"
                );
            }
        };

        useImperativeHandle(ref, () => ({
            initiatePayment,
        }));

        return null;
    }
);

Payment.displayName = "Payment";

export default Payment;