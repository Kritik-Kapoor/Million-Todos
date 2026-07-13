import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function VerifyEmailTokenLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <Card className="w-full max-w-sm p-4">
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Verifying your email...
          </p>
        </div>
      </Card>
    </div>
  );
}
