
import { Button } from "@/components/ui/button";

interface SendButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const SendButton = ({ onClick, isLoading }: SendButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading}
    >
      {isLoading ? "Sending..." : "Send Invitation"}
    </Button>
  );
};
