"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/hooks/useApiMutation";

const LogoutButton = () => {
  const router = useRouter();
  const { mutate: logout, loading } = useApiMutation("/auth/logout", {
    onSuccess: () => router.replace("/login"),
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-xl"
      disabled={loading}
      onClick={() => logout()}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      Logout
    </Button>
  );
};

export default LogoutButton;
