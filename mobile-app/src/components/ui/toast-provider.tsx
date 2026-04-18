import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/src/theme/colors";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const tone =
    item.type === "success"
      ? { bg: "#E8FFF2", color: colors.success, icon: "checkmark-circle" as const }
      : item.type === "error"
        ? { bg: "#FFECEC", color: colors.destructive, icon: "alert-circle" as const }
        : { bg: "#EEF4FF", color: colors.primary, icon: "information-circle" as const };

  Animated.parallel([
    Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
  ]).start();

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <Pressable
        onPress={() => onDismiss(item.id)}
        style={{
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          backgroundColor: colors.card,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 10px 22px rgba(24, 39, 75, 0.1)",
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tone.bg,
          }}
        >
          <Ionicons name={tone.icon} size={14} color={tone.color} />
        </View>
        <Text style={{ flex: 1, color: colors.foreground, fontWeight: "600", fontSize: 13 }} selectable>
          {item.message}
        </Text>
        <Ionicons name="close" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 54,
          left: 14,
          right: 14,
          gap: 8,
        }}
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismissToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
