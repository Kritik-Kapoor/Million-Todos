"use client";

import { useNotificationPanel } from "../hooks/useNotificationPanel";
import NotificationToggleRow from "./NotificationToggleRow";
import PanelHeader from "./PanelHeader";

const NotificationsPanel = ({
  dueDateReminder,
}: {
  dueDateReminder: boolean;
}) => {
  const {
    state: { notificationPreferences, isUpdating },
    actions: { handleToggle },
  } = useNotificationPanel({ dueDateReminder });

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
      </div>
    </div>
  );
};

export default NotificationsPanel;
