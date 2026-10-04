"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export interface SelectWithOtherOption {
  value: string;
  label: string;
}

interface SelectWithOtherProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: SelectWithOtherOption[];
  value: string;
  otherValue: string;
  onValueChange: (value: string) => void;
  onOtherChange: (value: string) => void;
  error?: string;
  className?: string;
}

const OTHER_VALUE = "other";

export function SelectWithOther({
  label,
  required,
  placeholder = "Select an option",
  options,
  value,
  otherValue,
  onValueChange,
  onOtherChange,
  error,
  className,
}: SelectWithOtherProps) {
  const isOther = value === OTHER_VALUE;

  return (
    <div className={className}>
      <Select
        label={label}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        error={isOther ? undefined : error}
        options={[...options, { value: OTHER_VALUE, label: "Other (type your own)" }]}
      />
      {isOther && (
        <Input
          className="mt-3"
          placeholder="Tell us what you do"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          error={error}
        />
      )}
    </div>
  );
}

export { OTHER_VALUE };