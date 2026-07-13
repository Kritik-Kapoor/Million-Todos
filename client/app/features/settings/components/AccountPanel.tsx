"use client";

import { AlertTriangle, EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/tailwindMerge";
import { useAccountPanel } from "../hooks/useAccountPanel";
import PanelHeader from "./PanelHeader";

type AccountPanelProps = {
  user: CurrentUser;
};

const AccountPanel = ({ user }: AccountPanelProps) => {
  const {
    state: {
      email,
      form,
      isValid,
      isSubmitting,
      isPasswordVisible,
      verificationEmailSent,
      isSendingVerificationEmail,
    },
    actions: { onSubmit, setIsPasswordVisible, sendVerificationEmail },
  } = useAccountPanel({ user });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Account"
        description="Manage your profile information."
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-md space-y-4"
      >
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1!">
                <FieldLabel htmlFor="username">Display name</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your display name"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field className="gap-1!">
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldDescription>Email cannot be changed.</FieldDescription>
              </div>
              {!user.isEmailVerified && (
                <Button
                  type="button"
                  size="sm"
                  className="w-fit"
                  disabled={isSendingVerificationEmail}
                  onClick={() => sendVerificationEmail()}
                >
                  {isSendingVerificationEmail && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {isSendingVerificationEmail
                    ? "Sending email..."
                    : "Verify Email"}
                </Button>
              )}
            </div>
            <div className="relative flex items-center gap-2 border border-input rounded-md bg-input/30 disabled">
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="cursor-not-allowed max-w-5/6 bg-transparent! border-none"
              />
              {user.isEmailVerified && (
                <span className="absolute right-2 flex items-center gap-1 text-green-500 text-xs">
                  Verified
                </span>
              )}
            </div>
          </Field>

          {verificationEmailSent && (
            <div className="bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-md w-fit">
              <p className="text-xs text-foreground">
                Check your email for a link to verify your account
              </p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Change password</p>
              <p className="text-xs text-muted-foreground">
                Leave blank to keep your current password.
              </p>
            </div>

            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1!">
                  <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md border bg-input/30",
                      fieldState.invalid
                        ? "border-destructive"
                        : "border-input",
                    )}
                  >
                    <Input
                      id="newPassword"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className="border-none bg-transparent!"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="text-muted-foreground shrink-0"
                    >
                      {isPasswordVisible ? (
                        <EyeIcon className="size-4" />
                      ) : (
                        <EyeOffIcon className="size-4" />
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
                <Field data-invalid={fieldState.invalid} className="gap-1!">
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm new password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    aria-invalid={fieldState.invalid}
                    className="aria-invalid:ring-0"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>

        <Button
          type="submit"
          className="w-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Saving changes..." : "Save changes"}
        </Button>
      </form>

      <Separator />
      <div className="space-y-2">
        <p className="text-sm font-medium">Danger zone</p>
        <p className="text-xs text-muted-foreground">
          Deleting your account is permanent and cannot be undone.
        </p>
        <Button type="button" variant="destructive" size="sm">
          <AlertTriangle className="h-4 w-4" />
          Delete account
        </Button>
      </div>
    </div>
  );
};

export default AccountPanel;
