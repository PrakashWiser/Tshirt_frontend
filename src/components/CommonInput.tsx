import React, {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type FocusEvent,
} from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  showLabel?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
  required = false,
  disabled = false,
  autoComplete,
  showLabel = true,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div>
      {showLabel && name && (
        <label className="mb-1 block text-sm capitalize text-gray-400">
          Enter {name.replace(/([A-Z])/g, " $1")}
        </label>
      )}

      <div className="relative">
        <input
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border border-gray-200 px-2 py-2 focus:outline-none  disabled:bg-gray-100 disabled:cursor-not-allowed ${isPassword ? "pr-10" : ""
            } ${className}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;