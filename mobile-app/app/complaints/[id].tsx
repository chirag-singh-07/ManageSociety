import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { PrimaryButton } from "@/src/components/primary-button";
import { AppDialog } from "@/src/components/ui/app-dialog";
import { useToast } from "@/src/components/ui/toast-provider";
import { colors, radius } from "@/src/theme/colors";
import { getComplaintDetail, type Complaint, type ComplaintComment } from "@/src/api/client";
import {
  getUploadQueueCount,
  loadCachedResource,
  saveCachedResource,
  type LocalAttachment,
} from "@/src/lib/offline-store";
import { processUploadQueue, submitCommentWithQueue } from "@/src/lib/upload-queue";

export default function ComplaintDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const complaintId = params.id;
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [queuedUploads, setQueuedUploads] = useState(0);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<{ visible: boolean; title: string; description: string }>({
    visible: false,
    title: "",
    description: "",
  });

  const statusColor = useMemo(
    () => ({
      open: colors.warning,
      in_progress: colors.primary,
      resolved: colors.success,
      rejected: colors.destructive,
    }),
    [],
  );

  const refreshQueuedCount = useCallback(async () => {
    const count = await getUploadQueueCount();
    setQueuedUploads(count);
  }, []);

  const loadDetail = useCallback(
    async (isPullRefresh = false) => {
      if (!complaintId || Array.isArray(complaintId)) {
        setLoading(false);
        return;
      }

      const cacheKey = `complaint_detail_${complaintId}`;

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

        const res = await getComplaintDetail(complaintId);
        setComplaint(res.complaint);
        setComments(res.comments ?? []);
        setUsingCache(false);
        await saveCachedResource(cacheKey, {
          complaint: res.complaint,
          comments: res.comments ?? [],
        });
      } catch {
        const cached = await loadCachedResource<{ complaint: Complaint; comments: ComplaintComment[] }>(cacheKey);
        if (cached) {
          setComplaint(cached.data.complaint);
          setComments(cached.data.comments ?? []);
          setUsingCache(true);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        await refreshQueuedCount();
      }
    },
    [complaintId, refreshQueuedCount, showToast],
  );

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail]),
  );

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
          name: asset.fileName ?? `comment_${Date.now()}.jpg`,
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
          name: asset.fileName ?? `comment_camera_${Date.now()}.jpg`,
          type: asset.mimeType ?? "image/jpeg",
          size: asset.fileSize ?? 0,
        },
      ]);
      showToast("Photo captured", "success");
    }
  };

  const submitComment = async () => {
    if (!complaintId || Array.isArray(complaintId)) return;

    if (!message.trim()) {
      setDialog({
        visible: true,
        title: "Missing Message",
        description: "Please enter your comment before posting.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const result = await submitCommentWithQueue({
        complaintId,
        message: message.trim(),
        attachments,
      });

      setMessage("");
      setAttachments([]);

      if (result.queued) {
        showToast("Comment saved and queued for upload when network is back.", "info");
      } else {
        showToast("Comment posted.", "success");
      }

      await loadDetail();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to submit comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaintId || Array.isArray(complaintId)) {
    return (
      <ScreenContainer>
        <PremiumCard>
          <Text style={{ color: colors.destructive, fontWeight: "700" }} selectable>
            Invalid complaint id.
          </Text>
        </PremiumCard>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer refreshing={refreshing} onRefresh={() => loadDetail(true)}>
        {(usingCache || queuedUploads > 0) && (
          <PremiumCard soft>
            {usingCache && (
              <Text style={{ color: colors.warning, fontSize: 12, fontWeight: "600" }} selectable>
                Showing cached detail. Pull to refresh when online.
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

        {loading ? (
          <Text style={{ color: colors.mutedForeground }} selectable>
            Loading complaint detail...
          </Text>
        ) : complaint ? (
          <>
            <PremiumCard>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }} selectable>
                {complaint.title}
              </Text>
              <Text style={{ color: colors.mutedForeground, marginTop: 8, lineHeight: 22 }} selectable>
                {complaint.description}
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                <Text style={{ color: colors.secondaryForeground, fontWeight: "700", fontSize: 12 }} selectable>
                  {complaint.priority.toUpperCase()}
                </Text>
                <Text style={{ color: statusColor[complaint.status], fontWeight: "700", fontSize: 12 }} selectable>
                  {complaint.status.replace("_", " ").toUpperCase()}
                </Text>
              </View>
              {complaint.attachments.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {complaint.attachments.map((file) => (
                    <Image
                      key={file.fileId}
                      source={{ uri: file.url }}
                      style={{ width: 72, height: 72, borderRadius: 10 }}
                      contentFit="cover"
                    />
                  ))}
                </View>
              )}
            </PremiumCard>

            <PremiumCard soft>
              <Text style={{ color: colors.secondaryForeground, fontWeight: "800", fontSize: 16 }} selectable>
                Add Comment
              </Text>
              <View style={{ gap: 10, marginTop: 10 }}>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Write an update..."
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
                  label={submitting ? "Posting..." : "Post Comment"}
                  onPress={submitComment}
                  disabled={submitting}
                  icon={<Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primaryForeground} />}
                />
              </View>
            </PremiumCard>

            <PremiumCard>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
                Comments ({comments.length})
              </Text>
            </PremiumCard>

            {comments.length === 0 ? (
              <PremiumCard>
                <Text style={{ color: colors.mutedForeground }} selectable>
                  No comments yet.
                </Text>
              </PremiumCard>
            ) : (
              comments.map((comment, index) => (
                <PremiumCard key={comment._id} enteringDelay={index * 40}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
                      Comment #{index + 1}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
                      {new Date(comment.createdAt).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <Text style={{ color: colors.foreground, marginTop: 8, lineHeight: 22 }} selectable>
                    {comment.message}
                  </Text>
                  {comment.attachments.length > 0 && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                      {comment.attachments.map((file) => (
                        <Image
                          key={file.fileId}
                          source={{ uri: file.url }}
                          style={{ width: 72, height: 72, borderRadius: 10 }}
                          contentFit="cover"
                        />
                      ))}
                    </View>
                  )}
                </PremiumCard>
              ))
            )}
          </>
        ) : (
          <PremiumCard>
            <Text style={{ color: colors.destructive, fontWeight: "700" }} selectable>
              Complaint not found.
            </Text>
          </PremiumCard>
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
