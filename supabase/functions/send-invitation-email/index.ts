
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  to_email: string;
  from_user_name: string;
  invitation_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, from_user_name, invitation_token }: InvitationEmailRequest = await req.json();

    const registrationUrl = `${req.headers.get('origin')}/register?invitation_token=${invitation_token}`;

    const emailResponse = await resend.emails.send({
      from: "GoalTracker <onboarding@resend.dev>",
      to: [to_email],
      subject: `${from_user_name} invited you to join their team on GoalTracker`,
      html: `
        <h1>You're invited to join ${from_user_name}'s team!</h1>
        <p>${from_user_name} has invited you to collaborate on GoalTracker.</p>
        <p>To accept this invitation, please register an account and the invitation will be automatically processed:</p>
        <a href="${registrationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Register & Accept Invitation</a>
        <p>If you already have an account, simply log in and check your notifications.</p>
        <p>Best regards,<br>The GoalTracker Team</p>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
