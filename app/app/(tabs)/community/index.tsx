import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateViews';
import { PostCard } from '@/components/community/PostCard';
import { services } from '@/services';
import { CommunityPost } from '@/types/domain';

export default function CommunityFeed() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await services.community.listPosts();
    setPosts(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text variant="h1" weight="bold" style={{ flex: 1 }}>
          {t('community.title')}
        </Text>
        <IconButton icon="create-outline" accessibilityLabel={t('community.writePost')} onPress={() => {}} variant="brand" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {posts === null && (
          <>
            <Skeleton height={140} radius={14} style={{ marginBottom: spacing.sm }} />
            <Skeleton height={140} radius={14} style={{ marginBottom: spacing.sm }} />
          </>
        )}

        {posts !== null && posts.length === 0 && (
          <EmptyState icon="chatbubbles-outline" title={t('community.noComments')} />
        )}

        {posts?.map((post) => (
          <PostCard key={post.id} post={post} onPress={() => router.push(`/(tabs)/community/${post.id}`)} />
        ))}
      </ScrollView>
    </View>
  );
}
