"use client";

import {
  FieldLabel,
  Field,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";

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

const RegisterPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();

  const { mutate: register, loading } = useApiMutation<RegisterInputs>(
    "/auth/register",
    {
      onSuccess: () => router.push("/"),
      onError: () => toast.error("Failed to register"),
    },
  );

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    const response = await register(data);
    if (!response)
      toast.error("Sorry, something went wrong. Please try again.");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <Card className="w-full max-w-sm p-4">
        <div className="mb-7 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to your account to continue
          </p>
        </div>
        <form
          className="w-full max-w-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@example.com"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div
                    className={`flex items-center gap-2 border rounded-md bg-muted ${fieldState.invalid ? "border-destructive" : "border-input"}`}
                  >
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="border-none bg-transparent"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="bg-transparent text-muted-foreground cursor-pointer"
                    >
                      {isPasswordVisible ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeOffIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="w-full mt-5" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </div>
            ) : (
              "Register"
            )}
          </Button>
        </form>
        <p className="text-muted-foreground text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
