"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { getResetPasswordLink } from "../api";

type ForgotInputs = {
  email: string;
};

const forgotFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

const useForgotPasswordPage = () => {
  const forgotMutation = useMutation({
    mutationFn: getResetPasswordLink,
    onSuccess: () => toast.success("Link to reset password sent to your email"),
    onError: () => toast.error("Invalid credentials"),
  });

  const form = useForm<z.infer<typeof forgotFormSchema>>({
    resolver: zodResolver(forgotFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotInputs> = (data) => {
    forgotMutation.mutate(data.email);
  };

  return {
    state: { form, loading: forgotMutation.isPending },
    actions: { onSubmit },
  };
};

export default useForgotPasswordPage;
