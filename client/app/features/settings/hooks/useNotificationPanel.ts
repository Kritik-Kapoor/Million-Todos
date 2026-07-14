"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import getErrorMessage from "@/lib/utils/getErrorMessage";
import { updateUserPreferences } from "../api";
import { NotificationPreferences } from "../types";

export function useNotificationPanel({
  dueDateReminder,
}: NotificationPreferences) {
  const router = useRouter();

  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      dueDateReminder,
    });

  const updateMutation = useMutation({
    mutationFn: updateUserPreferences,
    onMutate: (data) => {
      const previousState = notificationPreferences;
      setNotificationPreferences(data);
      return { previousState };
    },
    onSuccess: () => {
      router.refresh();
      toast.success("Notification preferences updated");
    },
    onError: (error, _, context) => {
      if (context?.previousState) {
        setNotificationPreferences(context.previousState);
      }
      toast.error(getErrorMessage(error));
    },
  });

  const handleToggle = useCallback(
    (field: keyof NotificationPreferences, value: boolean) => {
      if (updateMutation.isPending) return;

      updateMutation.mutate({
        [field]: value,
      });
    },
    [updateMutation],
  );

  return {
    state: {
      notificationPreferences,
      isUpdating: updateMutation.isPending,
    },
    actions: { handleToggle },
  };
}
