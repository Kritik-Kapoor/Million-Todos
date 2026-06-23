"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
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

import { useAccountPanel } from "../hooks/useAccountPanel";
import PanelHeader from "./PanelHeader";

type AccountPanelProps = {
  user: CurrentUser;
};

const AccountPanel = ({ user }: AccountPanelProps) => {
  const {
    state: { email, form, isValid, isSubmitting },
    actions: { handleSubmit },
  } = useAccountPanel({ user });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Account"
        description="Manage your profile information."
      />
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
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
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="cursor-not-allowed"
            />
            <FieldDescription>Email cannot be changed.</FieldDescription>
          </Field>

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
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
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
