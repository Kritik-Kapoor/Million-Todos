"use client";

import {
  FieldLabel,
  Field,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import useLoginPage from "@/features/(auth)/hooks/useLoginPage";

const LoginPage = () => {
  const {
    state: { form, isPasswordVisible, loading },
    actions: { setIsPasswordVisible, onSubmit },
  } = useLoginPage();

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 gap-3">
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
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
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
                    className={`flex items-center gap-2 border rounded-md bg-input/30 ${fieldState.invalid ? "border-destructive" : "border-input"}`}
                  >
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="border-none bg-transparent!"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="text-muted-foreground cursor-pointer"
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
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground text-right hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </FieldGroup>
          <Button type="submit" className="w-full mt-5" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <p className="text-muted-foreground text-sm text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </Card>
      <p className="text-sm text-muted-foreground text-center">
        New to Million Todos?{" "}
        <Button variant="link" asChild className="h-auto p-0 text-sm">
          <Link href="/">View app info</Link>
        </Button>
      </p>
    </div>
  );
};

export default LoginPage;
