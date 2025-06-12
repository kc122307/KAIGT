
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InvitationCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const InvitationCard = ({ title, description, children }: InvitationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
