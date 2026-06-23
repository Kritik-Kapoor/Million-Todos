"use client";

import SettingsModal from "@/features/settings/components/SettingsModal";
import { Loader2, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const Settings = ({
  isUserAvailable,
  user,
}: {
  isUserAvailable: boolean;
  user: CurrentUser;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        disabled={!isUserAvailable}
        onClick={() => setIsOpen(true)}
      >
        {!isUserAvailable ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <SettingsIcon className="size-4" />
        )}
        Settings
      </Button>
      <SettingsModal isOpen={isOpen} onOpenChange={setIsOpen} user={user} />
    </>
  );
};

export default Settings;
