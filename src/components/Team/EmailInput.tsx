
import { Input } from "@/components/ui/input";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EmailInput = ({ value, onChange, placeholder = "Enter email address or username" }: EmailInputProps) => {
  return (
    <Input 
      placeholder={placeholder}
      type="email" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="flex-1"
    />
  );
};
