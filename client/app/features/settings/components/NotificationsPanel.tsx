"use client";

import { useNotificationPanel } from "../hooks/useNotificationPanel";
import NotificationToggleRow from "./NotificationToggleRow";
import PanelHeader from "./PanelHeader";

const NotificationsPanel = ({
  dueDateReminder,
  dailyDigest,
}: {
  dueDateReminder: boolean;
  dailyDigest: boolean;
}) => {
  const {
    state: { notificationPreferences, isUpdating },
    actions: { handleToggle },
  } = useNotificationPanel({ dueDateReminder, dailyDigest });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Notifications"
        description="Choose what you want to be notified about."
      />

      <div className="divide-y rounded-lg border bg-card">
        <NotificationToggleRow
          title="Due date reminders"
          description="Get reminded when a todo is due."
          checked={notificationPreferences.dueDateReminder}
          onChange={(checked) => handleToggle("dueDateReminder", checked)}
          disabled={isUpdating}
        />
        <NotificationToggleRow
          title="Daily digest"
          description="A morning summary of your day's focus."
          checked={notificationPreferences.dailyDigest}
          onChange={(checked) => handleToggle("dailyDigest", checked)}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
};

export default NotificationsPanel;
