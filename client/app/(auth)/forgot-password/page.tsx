"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import useForgotPasswordPage from "@/features/(auth)/hooks/useForgotPasswordPage";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const {
    state: { form, loading, showSuccessMessage },
    actions: { onSubmit },
  } = useForgotPasswordPage();

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <Card className="w-full max-w-sm p-4">
        <div className="mb-5 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Forgot password?
          </h1>
          <p className="text-muted-foreground mt-1">
            Enter your registered email to reset your password
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
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your registered email"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
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
                <Loader2 className="w-4 h-4 animate-spin" /> Sending link...
              </div>
            ) : (
              "Get reset link"
            )}
          </Button>
        </form>
        <p className="text-muted-foreground text-sm text-center">
          Remember your password?
          <Link href="/login" className="text-blue-500 ml-1">
            Login
          </Link>
        </p>
        {showSuccessMessage && (
          <div className="bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-xl">
            <p className="text-foreground text-sm text-center">
              {showSuccessMessage}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
