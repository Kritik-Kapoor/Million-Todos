"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { getResetPasswordLink } from "../api";
import { useState } from "react";

type ForgotInputs = {
  email: string;
};

const forgotFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

const useForgotPasswordPage = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const form = useForm<z.infer<typeof forgotFormSchema>>({
    resolver: zodResolver(forgotFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotMutation = useMutation({
    mutationFn: getResetPasswordLink,
    onSuccess: ({ message }) => {
      setShowSuccessMessage(message);
      form.reset();
    },
    onError: () => {
      setShowSuccessMessage("");
      toast.error("Invalid credentials");
    },
  });

  const onSubmit: SubmitHandler<ForgotInputs> = (data) => {
    setShowSuccessMessage("");
    forgotMutation.mutate(data.email);
  };

  return {
    state: { form, loading: forgotMutation.isPending, showSuccessMessage },
    actions: { onSubmit },
  };
};

export default useForgotPasswordPage;
