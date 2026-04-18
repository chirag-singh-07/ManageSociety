import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { PrimaryButton } from "@/src/components/primary-button";
import { AppDialog } from "@/src/components/ui/app-dialog";
import { useToast } from "@/src/components/ui/toast-provider";
import { colors, radius } from "@/src/theme/colors";
import { getComplaints, type Complaint } from "@/src/api/client";
import {
  getUploadQueueCount,
  loadCachedResource,
  saveCachedResource,
  type LocalAttachment,
} from "@/src/lib/offline-store";
import { processUploadQueue, submitComplaintWithQueue } from "@/src/lib/upload-queue";

const CACHE_KEY = "complaints_list";
const categories = ["general", "security", "cleaning", "maintenance", "parking"] as const;
const filters = ["all", "open", "in_progress", "resolved", "rejected"] as const;

export default function ComplaintsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("general");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [queuedUploads, setQueuedUploads] = useState(0);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [dialog, setDialog] = useState<{ visible: boolean; title: string; description: string }>({
    visible: false,
    title: "",
    description: "",
  });

  const refreshQueuedCount = useCallback(async () => {
    const count = await getUploadQueueCount();
    setQueuedUploads(count);
  }, []);

  const loadComplaints = useCallback(
    async (isPullRefresh = false) => {
      try {
        if (isPullRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const queueResult = await processUploadQueue();
        if (queueResult.processed > 0) {
          showToast(`${queueResult.processed} pending upload(s) synced.`, "success");
        }

        const res = await getComplaints();
        const next = res.complaints ?? [];
        setComplaints(next);
        setUsingCache(false);
        await saveCachedResource(CACHE_KEY, next);
      } catch {
        const cached = await loadCachedResource<Complaint[]>(CACHE_KEY);
        if (cached) {
          setComplaints(cached.data);
          setUsingCache(true);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        await refreshQueuedCount();
      }
    },
    [refreshQueuedCount, showToast],
  );

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [loadComplaints]),
  );

  const stats = useMemo(() => {
    const open = complaints.filter((c) => c.status === "open" || c.status === "in_progress").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    return { total: complaints.length, open, resolved };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    if (filter === "all") return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  const addFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setDialog({
        visible: true,
        title: "Permission Needed",
        description: "Please allow gallery permission to attach photos.",
      });
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
      showToast("Photo added from gallery", "success");
    }
  };

  const capturePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setDialog({
        visible: true,
        title: "Permission Needed",
        description: "Please allow camera permission to capture photos.",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
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
      showToast("Photo captured", "success");
    }
  };

  const submitComplaint = async () => {
    if (!title.trim() || !description.trim()) {
      setDialog({
        visible: true,
        title: "Missing Fields",
        description: "Title and description are required to submit a complaint.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const result = await submitComplaintWithQueue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        attachments,
      });

      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
      setAttachments([]);

      if (result.queued) {
        showToast("No connection right now. Complaint saved and will auto-upload.", "info");
      } else {
        showToast("Complaint created", "success");
      }

      await loadComplaints();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create complaint", "error");
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
    <>
      <ScreenContainer refreshing={refreshing} onRefresh={() => loadComplaints(true)}>
        {(usingCache || queuedUploads > 0) && (
          <PremiumCard soft>
            {usingCache && (
              <Text style={{ color: colors.warning, fontSize: 12, fontWeight: "600" }} selectable>
                Showing cached complaints. Pull to refresh when online.
              </Text>
            )}
            {queuedUploads > 0 && (
              <Text
                style={{
                  color: colors.secondaryForeground,
                  fontSize: 12,
                  fontWeight: "600",
                  marginTop: usingCache ? 6 : 0,
                }}
                selectable
              >
                {queuedUploads} upload(s) waiting to sync.
              </Text>
            )}
          </PremiumCard>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PremiumCard>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
                Total
              </Text>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 20 }} selectable>
                {stats.total}
              </Text>
            </PremiumCard>
          </View>
          <View style={{ flex: 1 }}>
            <PremiumCard>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
                Open
              </Text>
              <Text style={{ color: colors.warning, fontWeight: "800", fontSize: 20 }} selectable>
                {stats.open}
              </Text>
            </PremiumCard>
          </View>
          <View style={{ flex: 1 }}>
            <PremiumCard>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
                Resolved
              </Text>
              <Text style={{ color: colors.success, fontWeight: "800", fontSize: 20 }} selectable>
                {stats.resolved}
              </Text>
            </PremiumCard>
          </View>
        </View>

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

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {categories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: category === item ? colors.secondary : colors.card,
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                  }}
                >
                  <Text style={{ color: colors.secondaryForeground, fontSize: 11, fontWeight: "700" }} selectable>
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {filters.map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: filter === item ? colors.primary : colors.borderSoft,
                  backgroundColor: filter === item ? "#EEF4FF" : colors.card,
                }}
              >
                <Text
                  style={{
                    color: filter === item ? colors.primary : colors.mutedForeground,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                  selectable
                >
                  {item.replace("_", " ").toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </PremiumCard>

        {loading ? (
          <Text style={{ color: colors.mutedForeground }} selectable>
            Loading complaints...
          </Text>
        ) : filteredComplaints.length === 0 ? (
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground }} selectable>
              No complaints in this filter.
            </Text>
          </PremiumCard>
        ) : (
          filteredComplaints.map((complaint, index) => (
            <Pressable
              key={complaint._id}
              onPress={() =>
                router.push({
                  pathname: "/complaints/[id]",
                  params: { id: complaint._id },
                })
              }
            >
              <PremiumCard enteringDelay={index * 50}>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "800" }} selectable>
                  {complaint.title}
                </Text>
                <Text style={{ color: colors.mutedForeground, marginTop: 4 }} selectable>
                  {complaint.description}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 10,
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: colors.secondaryForeground, fontWeight: "700", fontSize: 11 }} selectable>
                      {complaint.category.toUpperCase()}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontWeight: "700", fontSize: 11 }} selectable>
                      •
                    </Text>
                    <Text style={{ color: colors.secondaryForeground, fontWeight: "700", fontSize: 11 }} selectable>
                      {complaint.priority.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: statusColor[complaint.status], fontWeight: "700", fontSize: 12 }} selectable>
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
                  </View>
                </View>
              </PremiumCard>
            </Pressable>
          ))
        )}
      </ScreenContainer>

      <AppDialog
        visible={dialog.visible}
        title={dialog.title}
        description={dialog.description}
        onCancel={() => setDialog({ visible: false, title: "", description: "" })}
      />
    </>
  );
}
