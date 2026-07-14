"use client";

import { useNotificationPanel } from "../hooks/useNotificationPanel";
import NotificationToggleRow from "./NotificationToggleRow";
import PanelHeader from "./PanelHeader";
import type { NotificationPreferences } from "../types";

const NotificationsPanel = ({
  dueDateReminder,
  emailReminder,
}: NotificationPreferences) => {
  const {
    state: { notificationPreferences, isUpdating },
    actions: { handleToggle },
  } = useNotificationPanel({ dueDateReminder, emailReminder });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Notifications"
        description="Choose what you want to be notified about."
      />

      <div className="divide-y rounded-lg border bg-card">
        <NotificationToggleRow
          title="Due date reminders"
          description="Get reminded 6 hours before a todo is due."
          checked={notificationPreferences.dueDateReminder}
          onChange={(checked) => handleToggle("dueDateReminder", checked)}
          disabled={isUpdating}
        />
      </div>
      <div>
        <div className="mb-6">
          <p className="text-lg font-medium">Reminder Channels</p>
          <p className="text-muted-foreground">
            Choose how you want to be notified about due date reminders.
          </p>
        </div>
        <div className="divide-y rounded-lg border bg-card">
          <NotificationToggleRow
            title="Email"
            description="Send reminders to your registered email address."
            checked={notificationPreferences.emailReminder}
            onChange={(checked) => handleToggle("emailReminder", checked)}
            disabled={isUpdating || !notificationPreferences.dueDateReminder}
          />

          <NotificationToggleRow
            title="SMS"
            description="Send reminders via text message."
            upcomingFeature={true}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
