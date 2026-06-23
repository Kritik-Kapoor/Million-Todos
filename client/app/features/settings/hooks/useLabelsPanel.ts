"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { createLabel, deleteLabel, fetchLabels, updateLabel } from "../api";
import { labelQueryKeys } from "../constants";
import type { LabelItem } from "../types";
import getErrorMessage from "@/lib/utils/getErrorMessage";

export function useLabelsSection() {
  const queryClient = useQueryClient();

  const {
    data: labelsList,
    isPending: labelsPending,
    error: labelsError,
  } = useQuery({
    queryKey: labelQueryKeys.all,
    queryFn: ({ signal }) => fetchLabels(signal),
  });

  const createMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: (created) => {
      queryClient.setQueryData<LabelItem[]>(labelQueryKeys.all, (current) => [
        ...(current ?? []),
        created,
      ]);
      toast.success(`Label "${created.name}" created`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      labelId,
      data,
    }: {
      labelId: string;
      data: Partial<Pick<LabelItem, "name" | "color">>;
    }) => updateLabel(labelId, data),
    onMutate: async ({ labelId, data }) => {
      await queryClient.cancelQueries({ queryKey: labelQueryKeys.all });

      const previousLabels = queryClient.getQueryData<LabelItem[]>(
        labelQueryKeys.all,
      );

      queryClient.setQueryData<LabelItem[]>(labelQueryKeys.all, (current) =>
        (current ?? []).map((item) =>
          item.id === labelId ? { ...item, ...data } : item,
        ),
      );

      return { previousLabels };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData<LabelItem[]>(
        labelQueryKeys.all,
        context?.previousLabels,
      );
      toast.error(getErrorMessage(error));
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: labelQueryKeys.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLabel,
    onMutate: async (labelId) => {
      await queryClient.cancelQueries({ queryKey: labelQueryKeys.all });

      const previousLabels = queryClient.getQueryData<LabelItem[]>(
        labelQueryKeys.all,
      );

      queryClient.setQueryData<LabelItem[]>(labelQueryKeys.all, (current) =>
        (current ?? []).filter((item) => item.id !== labelId),
      );

      return { previousLabels };
    },
    onSuccess: () => toast.success("Label deleted"),
    onError: (error, _, context) => {
      queryClient.setQueryData<LabelItem[]>(
        labelQueryKeys.all,
        context?.previousLabels,
      );
      toast.error(getErrorMessage(error));
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: labelQueryKeys.all }),
  });

  const handleCreate = useCallback(
    async (name: string, color: string) => {
      await createMutation.mutateAsync({ name, color });
    },
    [createMutation],
  );

  const handleUpdate = useCallback(
    async (label: LabelItem) => {
      await updateMutation.mutateAsync({
        labelId: label.id,
        data: { name: label.name, color: label.color },
      });
    },
    [updateMutation],
  );

  return {
    state: {
      labels: labelsList ?? [],
      labelsPending: labelsPending,
      labelsError: labelsError ? getErrorMessage(labelsError) : null,
      creatingLabel: createMutation.isPending,
    },
    actions: {
      handleCreate,
      handleUpdate,
      deleteLabel: deleteMutation.mutate,
    },
  };
}
