import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { PrimaryButton } from "@/src/components/primary-button";
import { colors, radius } from "@/src/theme/colors";
import { createComplaint, getComplaints, getPresignedUrl, uploadToPresignedUrl, type Complaint } from "@/src/api/client";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

type LocalAttachment = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getComplaints();
      setComplaints(res.complaints ?? []);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [loadComplaints]),
  );

  const addFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow gallery permission");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          uri: asset.uri,
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          type: asset.mimeType ?? "image/jpeg",
          size: asset.fileSize ?? 0,
        },
      ]);
    }
  };

  const capturePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera permission");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          uri: asset.uri,
          name: asset.fileName ?? `camera_${Date.now()}.jpg`,
          type: asset.mimeType ?? "image/jpeg",
          size: asset.fileSize ?? 0,
        },
      ]);
    }
  };

  const uploadAttachments = async () => {
    const uploaded: Array<{ fileId: string; url: string; type: string; name: string }> = [];

    for (const item of attachments) {
      const presign = await getPresignedUrl({
        mimeType: item.type,
        size: Math.max(item.size, 1),
        fileName: item.name,
      });
      await uploadToPresignedUrl(presign.uploadUrl, item.uri, item.type);
      uploaded.push({
        fileId: presign.fileId,
        url: presign.publicUrl,
        type: item.type,
        name: item.name,
      });
    }

    return uploaded;
  };

  const submitComplaint = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing fields", "Title and description are required");
      return;
    }
    try {
      setSubmitting(true);
      const uploaded = await uploadAttachments();
      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        attachments: uploaded,
      });
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
      setAttachments([]);
      await loadComplaints();
      Alert.alert("Success", "Complaint created");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to create complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = useMemo(
    () => ({
      open: colors.warning,
      in_progress: colors.primary,
      resolved: colors.success,
      rejected: colors.destructive,
    }),
    [],
  );

  return (
    <ScreenContainer>
      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Create Complaint
        </Text>

        <View style={{ gap: 10, marginTop: 10 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.card,
            }}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your issue..."
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: radius.md,
              minHeight: 90,
              paddingHorizontal: 12,
              paddingVertical: 10,
              textAlignVertical: "top",
              backgroundColor: colors.card,
            }}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            {(["low", "medium", "high"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: priority === item ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSoft,
                }}
              >
                <Text
                  style={{
                    color: priority === item ? colors.primaryForeground : colors.foreground,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                  selectable
                >
                  {item.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={capturePhoto}
              style={{
                flex: 1,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                backgroundColor: colors.card,
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Ionicons name="camera-outline" size={16} color={colors.secondaryForeground} />
              <Text style={{ color: colors.secondaryForeground, fontWeight: "700" }} selectable>
                Camera
              </Text>
            </Pressable>
            <Pressable
              onPress={addFromGallery}
              style={{
                flex: 1,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                backgroundColor: colors.card,
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Ionicons name="images-outline" size={16} color={colors.secondaryForeground} />
              <Text style={{ color: colors.secondaryForeground, fontWeight: "700" }} selectable>
                Gallery
              </Text>
            </Pressable>
          </View>

          {attachments.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {attachments.map((file) => (
                <Image
                  key={file.uri}
                  source={{ uri: file.uri }}
                  style={{ width: 72, height: 72, borderRadius: 10 }}
                  contentFit="cover"
                />
              ))}
            </View>
          )}

          <PrimaryButton
            label={submitting ? "Submitting..." : "Submit Complaint"}
            onPress={submitComplaint}
            disabled={submitting}
            icon={<Ionicons name="send-outline" size={16} color={colors.primaryForeground} />}
          />
        </View>
      </PremiumCard>

      <PremiumCard>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }} selectable>
          Your Complaints
        </Text>
      </PremiumCard>

      {loading ? (
        <Text style={{ color: colors.mutedForeground }} selectable>
          Loading complaints...
        </Text>
      ) : (
        complaints.map((complaint) => (
          <PremiumCard key={complaint._id}>
            <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "800" }} selectable>
              {complaint.title}
            </Text>
            <Text style={{ color: colors.mutedForeground, marginTop: 4 }} selectable>
              {complaint.description}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ color: colors.secondaryForeground, fontWeight: "700", fontSize: 12 }} selectable>
                {complaint.priority.toUpperCase()}
              </Text>
              <Text
                style={{
                  color: statusColor[complaint.status],
                  fontWeight: "700",
                  fontSize: 12,
                }}
                selectable
              >
                {complaint.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </PremiumCard>
        ))
      )}
    </ScreenContainer>
  );
}
