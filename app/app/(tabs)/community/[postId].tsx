import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateViews';
import { services } from '@/services';
import { CommunityPost, Comment } from '@/types/domain';
import { formatRelativeTime } from '@/utils/geo';

export default function PostDetail() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const [post, setPost] = useState<CommunityPost | null | undefined>(undefined);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    services.community.getPost(postId).then(setPost);
    services.community.listComments(postId).then(setComments);
  }, [postId]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const c = await services.community.addComment(postId, draft.trim());
      setComments((prev) => [...(prev ?? []), c]);
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('community.title')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        {post === undefined && <Skeleton height={160} radius={14} />}
        {post === null && <EmptyState icon="alert-circle-outline" title={t('errors.genericTitle')} />}
        {post && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Avatar name={post.authorName} size={40} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text variant="body" weight="semibold">
                  {post.authorName}
                </Text>
                <Text variant="caption" color={colors.inkMuted}>
                  {formatRelativeTime(post.createdAt, t)}
                </Text>
              </View>
            </View>
            <Text variant="h2" weight="bold" style={{ marginBottom: spacing.xs }}>
              {post.title}
            </Text>
            <Text variant="body" color={colors.inkSubtle} style={{ marginBottom: spacing.lg }}>
              {post.body}
            </Text>

            <Divider />

            <Text variant="bodySm" weight="semibold" color={colors.inkMuted} style={{ marginVertical: spacing.sm }}>
              {t('community.comments')}
            </Text>

            {comments === null && <Skeleton height={40} radius={10} />}
            {comments !== null && comments.length === 0 && <Text variant="bodySm" color={colors.inkMuted}>{t('community.noComments')}</Text>}
            {comments?.map((c) => (
              <View key={c.id} style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                <Avatar name={c.authorName} size={30} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="bodySm" weight="semibold">
                    {c.authorName}
                  </Text>
                  <Text variant="bodySm" color={colors.inkSubtle}>
                    {c.body}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.sm,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.hairline,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Input placeholder={t('community.writeComment')} value={draft} onChangeText={setDraft} />
        </View>
        <IconButton icon="send" accessibilityLabel={t('community.writeComment')} variant="brand" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}
