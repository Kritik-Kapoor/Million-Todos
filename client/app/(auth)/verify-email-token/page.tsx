import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verifyEmail } from "@/features/(auth)/api";

type VerifyEmailTokenPageProps = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

function VerificationMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <Card className="w-full max-w-sm p-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 text-center">{message}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/">Go home</Link>
        </Button>
      </Card>
    </div>
  );
}

export default async function VerifyEmailTokenPage({
  searchParams,
}: VerifyEmailTokenPageProps) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <VerificationMessage
        title="Invalid link"
        message="This verification link is missing required information."
      />
    );
  }

  let verified = false;

  try {
    const result = await verifyEmail({ token, email });
    verified = result.success;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "This link may have expired or already been used.";

    return (
      <VerificationMessage title="Verification failed" message={message} />
    );
  }

  if (verified) {
    redirect("/");
  }

  return (
    <VerificationMessage
      title="Verification failed"
      message="Unable to verify your email. Please try again."
    />
  );
}
