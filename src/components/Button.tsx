"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
    variant?: "primary" | "outline";
    full?: boolean;
    disabled?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = "",
    variant = "primary",
    full = false,
    disabled = false,
    leftIcon,
    rightIcon,
    ...props
}) => {
    const base =
        "cursor-pointer rounded px-4 py-2 text-sm font-medium transition-all duration-300 sm:px-6 ";

    const variants: Record<"primary" | "outline", string> = {
        primary:
            "bg-[#003B1F] text-white hover:bg-[#002a15] hover:shadow-md",
        outline:
            "border border-[#003B1F] bg-white text-[#003B1F] hover:bg-[#003B1F]/5 hover:shadow-md"
    };

    const disabledStyle =
        "cursor-not-allowed opacity-50";

    return (
        <button
            disabled={disabled}
            className={`
        ${base}
        ${variants[variant]}
        ${full ? "w-full" : "w-auto"}
        ${disabled ? disabledStyle : ""}
        inline-flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {leftIcon}
            {children}
            {rightIcon}
        </button>
    );
};

export default Button;