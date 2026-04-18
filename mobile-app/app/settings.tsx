import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { AppDialog } from "@/src/components/ui/app-dialog";
import { useToast } from "@/src/components/ui/toast-provider";
import { colors, radius } from "@/src/theme/colors";

function SettingRow({
  icon,
  title,
  description,
  action,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.borderSoft,
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: 12,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.secondary,
          }}
        >
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
            {title}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }} selectable>
            {description}
          </Text>
        </View>
      </View>
      {action}
    </View>
  );
}

export default function SettingsScreen() {
  const { showToast } = useToast();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);

  const enabledCount = useMemo(
    () => [pushEnabled, emailEnabled, quietHoursEnabled, biometricEnabled].filter(Boolean).length,
    [pushEnabled, emailEnabled, quietHoursEnabled, biometricEnabled],
  );

  const toggleWithToast = (label: string, next: boolean, setter: (v: boolean) => void) => {
    setter(next);
    showToast(`${label} ${next ? "enabled" : "disabled"}`, "info");
  };

  return (
    <>
      <ScreenContainer>
        <PremiumCard padded={false}>
          <View
            style={{
              borderRadius: radius.xl,
              backgroundColor: colors.black,
              padding: 20,
              gap: 8,
            }}
          >
            <Text style={{ color: "#A5B4FC", fontSize: 12, fontWeight: "700" }} selectable>
              Preferences
            </Text>
            <Text style={{ color: colors.primaryForeground, fontSize: 26, fontWeight: "800" }} selectable>
              App Settings
            </Text>
            <Text style={{ color: "#CBD5E1", lineHeight: 22 }} selectable>
              Tune notifications, privacy, and experience options for your account.
            </Text>
            <View
              style={{
                marginTop: 4,
                alignSelf: "flex-start",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.12)",
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: colors.primaryForeground, fontSize: 11, fontWeight: "700" }} selectable>
                {enabledCount} preference toggles active
              </Text>
            </View>
          </View>
        </PremiumCard>

        <PremiumCard soft>
          <Text style={{ color: colors.secondaryForeground, fontWeight: "800", fontSize: 16 }} selectable>
            Notifications
          </Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            <SettingRow
              icon="notifications-outline"
              title="Push Notifications"
              description="Receive instant alerts for payments and complaints"
              action={
                <Switch
                  value={pushEnabled}
                  onValueChange={(next) => toggleWithToast("Push notifications", next, setPushEnabled)}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <SettingRow
              icon="mail-outline"
              title="Email Notifications"
              description="Get summary updates on your email"
              action={
                <Switch
                  value={emailEnabled}
                  onValueChange={(next) => toggleWithToast("Email notifications", next, setEmailEnabled)}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <SettingRow
              icon="moon-outline"
              title="Quiet Hours"
              description="Mute non-critical alerts at night"
              action={
                <Switch
                  value={quietHoursEnabled}
                  onValueChange={(next) => toggleWithToast("Quiet hours", next, setQuietHoursEnabled)}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
          </View>
        </PremiumCard>

        <PremiumCard soft>
          <Text style={{ color: colors.secondaryForeground, fontWeight: "800", fontSize: 16 }} selectable>
            Security
          </Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            <SettingRow
              icon="finger-print-outline"
              title="Biometric Unlock"
              description="Use fingerprint/face unlock where available"
              action={
                <Switch
                  value={biometricEnabled}
                  onValueChange={(next) => toggleWithToast("Biometric unlock", next, setBiometricEnabled)}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <SettingRow
              icon="key-outline"
              title="Change Password"
              description="You can change password from Profile > Account Tools"
              action={<Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
            />
          </View>
        </PremiumCard>

        <PremiumCard>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
            Support & Info
          </Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {[
              { icon: "help-circle-outline" as const, title: "Help Center" },
              { icon: "chatbox-ellipses-outline" as const, title: "Contact Society Admin" },
              { icon: "document-text-outline" as const, title: "Terms & Privacy" },
            ].map((item) => (
              <Pressable
                key={item.title}
                onPress={() => showToast(`${item.title} coming soon`, "info")}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.borderSoft,
                  borderRadius: radius.md,
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name={item.icon} size={16} color={colors.primary} />
                  <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setResetVisible(true)}
            style={{
              marginTop: 12,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: "#FFD8D8",
              backgroundColor: "#FFF5F5",
              paddingVertical: 11,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.destructive, fontWeight: "700" }} selectable>
              Reset Settings
            </Text>
          </Pressable>
        </PremiumCard>
      </ScreenContainer>

      <AppDialog
        visible={resetVisible}
        title="Reset Settings"
        description="This will reset local app preferences in this screen to default values."
        confirmText="Reset"
        destructive
        onConfirm={() => {
          setPushEnabled(true);
          setEmailEnabled(true);
          setQuietHoursEnabled(false);
          setBiometricEnabled(false);
          setResetVisible(false);
          showToast("Settings reset to defaults", "success");
        }}
        onCancel={() => setResetVisible(false)}
      />
    </>
  );
}
