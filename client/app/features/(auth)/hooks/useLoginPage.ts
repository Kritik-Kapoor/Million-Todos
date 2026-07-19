"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { loginUser } from "../api";

type LoginInputs = {
  email: string;
  password: string;
};

const loginFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 7, {
      message: "Password must be at least 8 characters long",
    }),
});

const useLoginPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInputs) => loginUser(data),
    onSuccess: () => router.push("/todos"),
    onError: () => toast.error("Invalid credentials"),
  });

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    loginMutation.mutate(data);
  };

  return {
    state: { form, isPasswordVisible, loading: loginMutation.isPending },
    actions: { setIsPasswordVisible, onSubmit },
  };
};

export default useLoginPage;
