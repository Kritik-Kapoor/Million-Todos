"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { resetPassword } from "../api";

type ResetPasswordInputs = {
  newPassword: string;
  confirmPassword: string;
};

const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const useResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const resetPasswordToken = typeof token === "string" ? token : undefined;
  const invalidLink = !resetPasswordToken;

  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { resetPasswordToken: string; newPassword: string }) =>
      resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/login");
    },
    onError: () =>
      toast.error("Failed to reset password. The link may have expired."),
  });

  const onSubmit: SubmitHandler<ResetPasswordInputs> = (data) => {
    if (!resetPasswordToken) return;
    resetPasswordMutation.mutate({
      resetPasswordToken,
      newPassword: data.newPassword,
    });
  };

  return {
    state: {
      form,
      isPasswordVisible,
      loading: resetPasswordMutation.isPending,
      invalidLink,
    },
    actions: { setIsPasswordVisible, onSubmit },
  };
};

export default useResetPasswordPage;
