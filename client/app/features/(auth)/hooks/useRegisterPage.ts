"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser } from "../api";

type RegisterInputs = {
  username: string;
  email: string;
  password: string;
};

const registerFormSchema = z.object({
  username: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 2, {
      message: "Username must be at least 3 characters long",
    }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 7, {
      message: "Password must be at least 8 characters long",
    }),
});

const useRegisterPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInputs) => registerUser(data),
    onSuccess: () => router.push("/"),
    onError: () => toast.error("Failed to register"),
  });

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterInputs> = (data) => {
    registerMutation.mutate(data);
  };

  return {
    state: { form, isPasswordVisible, loading: registerMutation.isPending },
    actions: { setIsPasswordVisible, onSubmit },
  };
};

export default useRegisterPage;
