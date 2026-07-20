import type { ChangeEvent } from "react";

interface InputFieldProps {
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  showLabel?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
  showLabel = true,
  className = "",
}) => {
  return (
    <div>
      {showLabel && name && (
        <label className={`block mb-1 text-sm  capitalize text-gray-400`}>
          Enter  {name.replace(/([A-Z])/g, " $1")}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full border border-gray-200 px-2 py-1.5 rounded-sm focus:outline-none ${className}`}
      />
    </div>
  );
};

export default InputField;