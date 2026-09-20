import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { CommunityPost } from '@/types/domain';
import { formatRelativeTime } from '@/utils/geo';

export function PostCard({ post, onPress }: { post: CommunityPost; onPress?: () => void }) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          <Avatar name={post.authorName} size={32} />
          <View style={{ marginLeft: spacing.xs }}>
            <Text variant="bodySm" weight="semibold">
              {post.authorName}
            </Text>
            <Text variant="micro" color={colors.inkMuted}>
              {formatRelativeTime(post.createdAt, t)}
            </Text>
          </View>
        </View>
        <Text variant="body" weight="semibold" numberOfLines={2} style={{ marginBottom: 4 }}>
          {post.title}
        </Text>
        <Text variant="bodySm" color={colors.inkSubtle} numberOfLines={2} style={{ marginBottom: spacing.sm }}>
          {post.body}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={15} color={colors.inkMuted} />
          <Text variant="caption" color={colors.inkMuted} style={{ marginLeft: 4, marginRight: 14 }}>
            {post.reactionCount}
          </Text>
          <Ionicons name="chatbubble-outline" size={14} color={colors.inkMuted} />
          <Text variant="caption" color={colors.inkMuted} style={{ marginLeft: 4 }}>
            {post.commentCount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
