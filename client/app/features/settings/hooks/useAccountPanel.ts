"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import getErrorMessage from "@/lib/utils/getErrorMessage";
import { sendVerificationEmail, updateAccount } from "../api";
import type { UpdateAccountPayload } from "../types";

const accountFormSchema = z
  .object({
    username: z.string().trim().min(1, "Display name is required"),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    const password = data.newPassword.trim();
    const confirmPassword = data.confirmPassword.trim();

    if (!password && !confirmPassword) return;

    if (password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters long",
        path: ["newPassword"],
      });
    }

    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type AccountFormValues = z.infer<typeof accountFormSchema>;

type UseAccountPanelOptions = {
  user: CurrentUser;
};

export function useAccountPanel({ user }: UseAccountPanelOptions) {
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    mode: "onChange",
    defaultValues: {
      username: user.username,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: (updatedUser) => {
      form.reset({
        username: updatedUser.username,
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Account updated successfully");
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const sendVerificationEmailMutation = useMutation({
    mutationFn: sendVerificationEmail,
    onSuccess: () => setVerificationEmailSent(true),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onSubmit: SubmitHandler<AccountFormValues> = useCallback(
    (data) => {
      const payload: UpdateAccountPayload = {
        username: data.username.trim(),
      };

      const newPassword = data.newPassword.trim();
      const confirmPassword = data.confirmPassword.trim();

      if (newPassword && confirmPassword) {
        payload.password = newPassword;
      }

      updateMutation.mutate(payload);
    },
    [updateMutation],
  );

  return {
    state: {
      email: user.email,
      form,
      isValid: form.formState.isValid,
      isSubmitting: updateMutation.isPending,
      isPasswordVisible,
      verificationEmailSent,
      isSendingVerificationEmail: sendVerificationEmailMutation.isPending,
    },
    actions: {
      onSubmit,
      setIsPasswordVisible,
      sendVerificationEmail: sendVerificationEmailMutation.mutateAsync,
    },
  };
}
