import { useRef, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/app/components/ui/utils";

export type AccountSettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in the avatar circle; updates when the user picks a new image if `onAvatarUpload` is provided. */
  avatarUrl: string;
  /** Persist avatar (e.g. parent updates state + `localStorage`). */
  onAvatarUpload?: (e: ChangeEvent<HTMLInputElement>) => void;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultEmail?: string;
  className?: string;
};

/**
 * Account settings (profile + password) in a right-side sheet, using design tokens for light/dark.
 * Body content stays inside sheet content so it remains within the drawer and scrolls there.
 */
export function AccountSettingsSheet({
  open,
  onOpenChange,
  avatarUrl,
  onAvatarUpload,
  defaultFirstName = "John",
  defaultLastName = "Doe",
  defaultEmail = "john.doe@acmecorp.com",
  className,
}: AccountSettingsSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        inset="floating"
        className={cn("gap-0 p-0", className)}
      >
        <div className="px-6 pb-8 pt-4 pr-14">
          <SheetHeader className="gap-2 p-0 text-left">
            <SheetTitle className="text-xl font-semibold tracking-tight">
              Account
            </SheetTitle>
            <SheetDescription>
              Update your profile and personal details here
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 flex flex-col gap-8">
            <section className="flex flex-col gap-6" aria-labelledby="account-profile-heading">
              <h2
                id="account-profile-heading"
                className="text-base font-semibold text-foreground"
              >
                Profile
              </h2>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Avatar</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onAvatarUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      className="w-fit"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="size-4" aria-hidden />
                      Upload
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      For best results, upload an image 512×512 or larger.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-first-name">First name</Label>
                  <Input
                    id="account-first-name"
                    name="firstName"
                    autoComplete="given-name"
                    defaultValue={defaultFirstName}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-last-name">Last name</Label>
                  <Input
                    id="account-last-name"
                    name="lastName"
                    autoComplete="family-name"
                    defaultValue={defaultLastName}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="account-email">Email</Label>
                <Input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={defaultEmail}
                />
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-6" aria-labelledby="account-password-heading">
              <h2
                id="account-password-heading"
                className="text-base font-semibold text-foreground"
              >
                Password
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-current-password">Current password</Label>
                  <Input
                    id="account-current-password"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-new-password">New password</Label>
                  <Input
                    id="account-new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your password must have at least 8 characters, include one
                    uppercase letter, and one number.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-confirm-password">
                    Re-type new password
                  </Label>
                  <Input
                    id="account-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-type new password"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button">Change password</Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
