import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { colors, radius } from "@/src/theme/colors";

type AppDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
};

export function AppDialog({
  visible,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmDisabled = false,
  destructive = false,
}: AppDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: radius.xl,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            padding: 16,
            gap: 12,
            boxShadow: "0 16px 36px rgba(10, 20, 40, 0.18)",
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }} selectable>
            {title}
          </Text>
          {description ? (
            <Text style={{ color: colors.mutedForeground, lineHeight: 20 }} selectable>
              {description}
            </Text>
          ) : null}

          {children}

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={onCancel}
              style={{
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                paddingVertical: 10,
                paddingHorizontal: 14,
                backgroundColor: colors.backgroundSoft,
              }}
            >
              <Text style={{ color: colors.secondaryForeground, fontWeight: "700" }} selectable>
                {cancelText}
              </Text>
            </Pressable>

            {onConfirm ? (
              <Pressable
                disabled={confirmDisabled}
                onPress={onConfirm}
                style={{
                  borderRadius: radius.md,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  backgroundColor: destructive ? colors.destructive : colors.primary,
                  opacity: confirmDisabled ? 0.5 : 1,
                }}
              >
                <Text style={{ color: colors.primaryForeground, fontWeight: "700" }} selectable>
                  {confirmText}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
