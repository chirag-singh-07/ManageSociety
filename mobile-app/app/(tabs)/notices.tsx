import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { colors } from "@/src/theme/colors";
import { getNotices, type Notice } from "@/src/api/client";
import { loadCachedResource, saveCachedResource } from "@/src/lib/offline-store";

const CACHE_KEY = "notices_list";

export default function NoticesScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCache, setUsingCache] = useState(false);

  const loadNotices = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await getNotices();
      const next = res.notices ?? [];
      setNotices(next);
      setUsingCache(false);
      await saveCachedResource(CACHE_KEY, next);
    } catch {
      const cached = await loadCachedResource<Notice[]>(CACHE_KEY);
      if (cached) {
        setNotices(cached.data);
        setUsingCache(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotices();
    }, [loadNotices]),
  );

  const importantCount = useMemo(
    () => notices.filter((n) => /urgent|important|notice/i.test(`${n.title} ${n.body}`)).length,
    [notices],
  );

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => loadNotices(true)}>
      {usingCache && (
        <Text style={{ color: colors.warning, fontWeight: "600", fontSize: 12 }} selectable>
          Showing cached notices. Pull to refresh when online.
        </Text>
      )}

      <PremiumCard padded={false}>
        <View
          style={{
            backgroundColor: colors.black,
            borderRadius: 24,
            padding: 20,
            gap: 10,
          }}
        >
          <Text style={{ color: "#A5B4FC", fontWeight: "700", fontSize: 12 }} selectable>
            Notice Center
          </Text>
          <Text style={{ color: colors.primaryForeground, fontWeight: "800", fontSize: 26 }} selectable>
            {loading ? "..." : notices.length} Updates
          </Text>
          <Text style={{ color: "#CBD5E1" }} selectable>
            {loading ? "Syncing latest notices..." : `${importantCount} marked as important`}
          </Text>
        </View>
      </PremiumCard>

      {loading ? (
        <Text style={{ color: colors.mutedForeground }} selectable>
          Loading notices...
        </Text>
      ) : notices.length === 0 ? (
        <PremiumCard>
          <Text style={{ color: colors.mutedForeground }} selectable>
            No notices available.
          </Text>
        </PremiumCard>
      ) : (
        notices.map((notice, index) => {
          const isImportant = /urgent|important|notice/i.test(`${notice.title} ${notice.body}`);

          return (
            <PremiumCard key={notice._id} enteringDelay={index * 60}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: colors.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={isImportant ? "notifications" : "megaphone"} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
                    {notice.title}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
                    {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString("en-IN") : "Draft"}
                  </Text>
                </View>
                {isImportant && (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#FFF5E8" }}>
                    <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 11 }} selectable>
                      IMPORTANT
                    </Text>
                  </View>
                )}
              </View>

              <Text style={{ color: colors.foreground, lineHeight: 22, marginTop: 10 }} selectable>
                {notice.body}
              </Text>
            </PremiumCard>
          );
        })
      )}
    </ScreenContainer>
  );
}
