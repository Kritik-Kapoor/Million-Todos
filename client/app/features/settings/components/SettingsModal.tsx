"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SettingsTabKey } from "../types";
import AccountPanel from "./AccountPanel";
import AppearancePanel from "./AppearancePanel";
import DataPanel from "./DataPanel";
import LabelsPanel from "./LabelsPanel";
import NotificationsPanel from "./NotificationsPanel";
import SettingsSidebar from "./SettingsSidebar";

type SettingsModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: CurrentUser;
};

const SettingsModal = ({ isOpen, onOpenChange, user }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("labels");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your labels, account and app preferences.
        </DialogDescription>

        <div className="flex h-[600px] max-h-[80vh]">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "labels" && <LabelsPanel />}
            {activeTab === "account" && <AccountPanel user={user} />}
            {activeTab === "appearance" && <AppearancePanel />}
            {activeTab === "notifications" && (
              <NotificationsPanel
                dueDateReminder={user.dueDateReminder}
                dailyDigest={user.dailyDigest}
              />
            )}
            {activeTab === "data" && <DataPanel />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
