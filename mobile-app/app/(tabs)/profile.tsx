import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/src/components/screen-container";
import { PrimaryButton } from "@/src/components/primary-button";
import { PremiumCard } from "@/src/components/premium-card";
import { AppDialog } from "@/src/components/ui/app-dialog";
import { useToast } from "@/src/components/ui/toast-provider";
import { colors, radius } from "@/src/theme/colors";
import { useAuth } from "@/src/auth/auth-context";
import { changePassword, updateMe } from "@/src/api/client";

export default function ProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, logout, reloadMe } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setNameInput(user.name ?? "");
      setPhoneInput(user.phone ?? "");
    }
  }, [user]);

  const refreshProfile = async () => {
    try {
      setRefreshing(true);
      await reloadMe();
      showToast("Profile refreshed", "info");
    } catch {
      showToast("Unable to refresh profile", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const saveProfile = async () => {
    if (!nameInput.trim()) {
      showToast("Name is required", "error");
      return;
    }

    try {
      setSavingProfile(true);
      await updateMe({
        name: nameInput.trim(),
        phone: phoneInput.trim() || undefined,
      });
      await reloadMe();
      setEditVisible(false);
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill all password fields", "error");
      return;
    }
    if (newPassword.length < 10) {
      showToast("New password must be at least 10 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password must match", "error");
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({ oldPassword: currentPassword, newPassword });
      setPasswordVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to change password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const profileCompleteness = useMemo(() => {
    let filled = 0;
    if (user?.name) filled += 1;
    if (user?.phone) filled += 1;
    if (user?.email) filled += 1;
    if (user?.flatNumber) filled += 1;
    return Math.round((filled / 4) * 100);
  }, [user]);

  return (
    <>
      <ScreenContainer refreshing={refreshing} onRefresh={refreshProfile}>
        <PremiumCard padded={false}>
          <View
            style={{
              borderRadius: radius.xl,
              backgroundColor: colors.primary,
              padding: 20,
              gap: 14,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -16,
                bottom: -16,
                width: 90,
                height: 90,
                borderRadius: 99,
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
            />
            <View
              style={{
                width: 74,
                height: 74,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                contentFit="cover"
                style={{ width: 52, height: 52, borderRadius: 18 }}
              />
            </View>
            <Text style={{ color: colors.primaryForeground, fontSize: 24, fontWeight: "800" }} selectable>
              {user?.name ?? "Member"}
            </Text>
            <Text style={{ color: "#E3EEFF" }} selectable>
              {user?.flatNumber ? `Flat ${user.flatNumber}` : "No flat mapped"}
            </Text>

            <View style={{ marginTop: 4 }}>
              <Text style={{ color: "#DDE8FF", fontSize: 12, fontWeight: "700" }} selectable>
                Profile completeness: {profileCompleteness}%
              </Text>
              <View style={{ marginTop: 8, height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
                <View style={{ width: `${profileCompleteness}%`, height: "100%", backgroundColor: colors.primaryForeground }} />
              </View>
            </View>
          </View>
        </PremiumCard>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PremiumCard>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
                Role
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }} selectable>
                {user?.role || "-"}
              </Text>
            </PremiumCard>
          </View>
          <View style={{ flex: 1 }}>
            <PremiumCard>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
                Flat
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }} selectable>
                {user?.flatNumber || "-"}
              </Text>
            </PremiumCard>
          </View>
        </View>

        <PremiumCard>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
            Contact Number
          </Text>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginTop: 6 }} selectable>
            {user?.phone || "Not available"}
          </Text>
        </PremiumCard>

        <PremiumCard>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
            Email
          </Text>
          <Text style={{ color: colors.foreground, fontWeight: "700", marginTop: 6 }} selectable>
            {user?.email || "-"}
          </Text>
        </PremiumCard>

        <PremiumCard soft>
          <Text style={{ color: colors.secondaryForeground, fontWeight: "800", fontSize: 16 }} selectable>
            Account Tools
          </Text>

          <View style={{ gap: 10, marginTop: 10 }}>
            <Pressable
              onPress={() => setEditVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
                  Edit Profile Info
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => setPasswordVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="key-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
                  Change Password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/settings" as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="settings-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
                  Open Settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </PremiumCard>

        <PrimaryButton
          label="Log Out"
          variant="secondary"
          onPress={() => setLogoutVisible(true)}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.secondaryForeground} />}
        />
      </ScreenContainer>

      <AppDialog
        visible={editVisible}
        title="Update Profile"
        description="Keep your contact details updated for better society communication."
        confirmText={savingProfile ? "Saving..." : "Save"}
        confirmDisabled={savingProfile || !nameInput.trim()}
        onConfirm={saveProfile}
        onCancel={() => setEditVisible(false)}
      >
        <View style={{ gap: 10 }}>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Full name"
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <TextInput
            value={phoneInput}
            onChangeText={setPhoneInput}
            placeholder="Phone number"
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>
      </AppDialog>

      <AppDialog
        visible={passwordVisible}
        title="Change Password"
        description="Use a strong password with at least 10 characters."
        confirmText={savingPassword ? "Updating..." : "Update Password"}
        confirmDisabled={savingPassword}
        onConfirm={submitPasswordChange}
        onCancel={() => setPasswordVisible(false)}
      >
        <View style={{ gap: 10 }}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>
      </AppDialog>

      <AppDialog
        visible={logoutVisible}
        title="Log Out"
        description="Are you sure you want to log out from this device?"
        confirmText="Log Out"
        destructive
        onConfirm={async () => {
          try {
            await logout();
            showToast("Logged out successfully", "success");
          } catch {
            showToast("Unable to logout right now", "error");
          } finally {
            setLogoutVisible(false);
          }
        }}
        onCancel={() => setLogoutVisible(false)}
      />
    </>
  );
}
