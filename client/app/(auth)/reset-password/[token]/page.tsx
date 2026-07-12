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
import useResetPasswordPage from "@/features/(auth)/hooks/useResetPasswordPage";

const ResetPasswordPage = () => {
  const {
    state: { form, isPasswordVisible, loading, invalidLink },
    actions: { setIsPasswordVisible, onSubmit },
  } = useResetPasswordPage();

  if (invalidLink) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="w-full max-w-sm p-4">
          <div className="mb-7 flex flex-col items-center justify-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Invalid link</h1>
            <p className="text-muted-foreground mt-1 text-center">
              The link you are trying to access may have expired or been used
              already.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <Card className="w-full max-w-sm p-4">
        <div className="mb-7 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
          <p className="text-muted-foreground mt-1 text-center">
            Choose a new password for your account
          </p>
        </div>
        <form
          className="w-full max-w-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <div
                    className={`flex items-center gap-2 border rounded-md bg-input/30 ${fieldState.invalid ? "border-destructive" : "border-input"}`}
                  >
                    <Input
                      id="newPassword"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter your new password"
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
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <div
                    className={`flex items-center gap-2 border rounded-md bg-input/30 ${fieldState.invalid ? "border-destructive" : "border-input"}`}
                  >
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      className="border-none bg-transparent!"
                      {...field}
                    />
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
                <Loader2 className="w-4 h-4 animate-spin" /> Resetting
                password...
              </div>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
