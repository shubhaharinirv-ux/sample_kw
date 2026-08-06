"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser, changePassword } from "@/features/auth/api/auth.api";
import { pushToast } from "@/shared/lib/toast";

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load profile. Please try refreshing.
      </div>
    );
  }

  // Dynamic key-value pairs
  const profileFields: Record<string, string | undefined> = {
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#f6f7fb] py-3 mr-3">
      <div className="flex flex-col flex-1 bg-white rounded-md border border-[#E5E7EB] overflow-hidden h-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            My Profile
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto p-4 space-y-6">

          {/* Profile Info */}
          <Card className="shadow-sm">
            <CardContent className="space-y-2 pt-5 pb-5">
              {Object.entries(profileFields).map(([key, value]) => (
                <p key={key} className="text-gray-600 text-[14px] font-light">
                  <span className="font-semibold text-gray-800">{key}:</span> {value ?? "-"}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">
                Change Password
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 pt-1">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
                    pushToast({ title: "Error", description: "All fields are required", variant: "error" });
                    return;
                  }
                  if (passwordForm.new !== passwordForm.confirm) {
                    pushToast({ title: "Error", description: "New passwords do not match", variant: "error" });
                    return;
                  }
                  if (passwordForm.new.length < 6) {
                    pushToast({ title: "Error", description: "Password must be at least 6 characters", variant: "error" });
                    return;
                  }
                  try {
                    setSubmitting(true);
                    await changePassword(passwordForm.current, passwordForm.new);
                    pushToast({ title: "Success", description: "Password updated successfully", variant: "success" });
                    setPasswordForm({ current: "", new: "", confirm: "" });
                  } catch (err: any) {
                    pushToast({ title: "Error", description: err.message || "Failed to update password", variant: "error" });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <div className="space-y-4">
                  {["current", "new", "confirm"].map((type) => (
                    <div key={type} className="space-y-1.5">
                      <label className="block text-sm text-gray-700 font-normal">
                        {type === "current"
                          ? "Current Password"
                          : type === "new"
                          ? "New Password"
                          : "Confirm New Password"}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword[type as keyof typeof showPassword] ? "text" : "password"}
                          placeholder={`Enter ${
                            type === "confirm"
                              ? "Confirm New Password"
                              : type === "new"
                              ? "New Password"
                              : "Current Password"
                          }`}
                          className="pr-10 text-sm border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:border-gray-300"
                          value={passwordForm[type as keyof typeof passwordForm]}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              [type]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              [type]: !prev[type as keyof typeof showPassword],
                            }))
                          }
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        >
                          {showPassword[type as keyof typeof showPassword] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Button left aligned */}
                <div className="pt-4 flex justify-start">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white text-sm font-medium px-5 py-2 rounded-md shadow-sm"
                  >
                    {submitting ? "Updating..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
