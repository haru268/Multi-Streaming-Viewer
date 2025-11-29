import { Platform } from '../types';

export const extractStreamId = (url: string, platform: Platform): string => {
  if (!url) return '';

  if (platform === 'youtube') {
    // YouTube URL形式: https://www.youtube.com/watch?v=VIDEO_ID
    // または: https://youtu.be/VIDEO_ID
    // または: VIDEO_ID (直接IDの場合)
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|^)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
  } else if (platform === 'twitch') {
    // Twitch URL形式: https://www.twitch.tv/CHANNEL_NAME
    // または: CHANNEL_NAME (直接チャンネル名の場合)
    let cleanedUrl = url.trim();
    
    // URL形式の場合、パスからチャンネル名を抽出
    if (cleanedUrl.includes('twitch.tv/')) {
      const urlMatch = cleanedUrl.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
      if (urlMatch) {
        return urlMatch[1].toLowerCase(); // Twitchのチャンネル名は小文字
      }
    }
    
    // 直接チャンネル名の場合（URL形式でない場合）
    // URL全体が入力されている場合は、最後のスラッシュ以降を取得
    if (cleanedUrl.includes('/')) {
      const parts = cleanedUrl.split('/');
      const lastPart = parts[parts.length - 1];
      // URLパラメータを除去
      const channelName = lastPart.split('?')[0].split('#')[0];
      if (channelName && /^[a-zA-Z0-9_]+$/.test(channelName)) {
        return channelName.toLowerCase();
      }
    }
    
    // そのまま返す（既にチャンネル名のみの場合）
    const channelName = cleanedUrl.replace(/[^a-zA-Z0-9_]/g, '');
    return channelName ? channelName.toLowerCase() : '';
  } else if (platform === 'twitcasting') {
    // ツイキャス URL形式: https://twitcasting.tv/USER_ID
    // または: @USER_ID または USER_ID (直接ユーザーIDの場合)
    // @記号を除去
    let cleanedUrl = url.replace(/^@/, '').trim();
    
    // URL形式の場合、パスからユーザーIDを抽出
    if (cleanedUrl.includes('twitcasting.tv/')) {
      const urlMatch = cleanedUrl.match(/twitcasting\.tv\/([a-zA-Z0-9_]+)/);
      if (urlMatch) {
        return urlMatch[1];
      }
    }
    
    // 直接ユーザーIDの場合（URL形式でない場合）
    // URL全体が入力されている場合は、最後のスラッシュ以降を取得
    if (cleanedUrl.includes('/')) {
      const parts = cleanedUrl.split('/');
      const lastPart = parts[parts.length - 1];
      // URLパラメータを除去
      const userId = lastPart.split('?')[0].split('#')[0];
      if (userId && /^[a-zA-Z0-9_]+$/.test(userId)) {
        return userId;
      }
    }
    
    // そのまま返す（既にユーザーIDのみの場合）
    return cleanedUrl.replace(/[^a-zA-Z0-9_]/g, '');
  }
  return url;
};

export const getEmbedUrl = (streamId: string, platform: Platform, isMuted: boolean = true): string => {
  if (!streamId) return '';

  // 規約遵守: デフォルトはミュート（isMutedのデフォルト値をtrueに変更）
  // ユーザーが明示的に音声ONにした場合のみ、isMuted=falseになる
  if (platform === 'youtube') {
    // 規約遵守: YouTube埋め込みは公式APIで認められたパラメータのみ使用
    // muteパラメータでミュート制御（デフォルトはミュート）
    return `https://www.youtube.com/embed/${streamId}?autoplay=1&mute=${isMuted ? 1 : 0}`;
  } else if (platform === 'twitch') {
    // 規約遵守: Twitch埋め込みは公式APIで認められたパラメータのみ使用
    // parentパラメータは必須（セキュリティ要件）、mutedパラメータでミュート制御
    const hostname = window.location.hostname || 'localhost';
    // ポート番号を含めないホスト名を使用（Twitchの要件）
    const parentHost = hostname === 'localhost' ? 'localhost' : hostname.split(':')[0];
    // Twitchの埋め込みURL形式: channelパラメータとparentパラメータが必須
    // autoplayはデフォルトでtrue、mutedでミュート制御
    // ビューポートの可視性要件を満たすため、適切なパラメータを設定
    return `https://player.twitch.tv/?channel=${streamId}&parent=${parentHost}&muted=${isMuted}`;
  } else if (platform === 'twitcasting') {
    // 規約遵守: ツイキャスは埋め込みパラメータでミュート制御ができない
    // iframe内の制御は行わず、ユーザーがプレイヤー内で操作する必要がある
    // 埋め込みコードの改変は禁止
    // ツイキャスの正しい埋め込みURL形式を使用
    // @記号が含まれている場合は除去
    const cleanStreamId = streamId.replace(/^@/, '').trim();
    // ユーザーIDのみを抽出（URLやその他の文字を除去）
    const userId = cleanStreamId.replace(/[^a-zA-Z0-9_]/g, '');
    if (!userId) return '';
    // ツイキャスの正しい埋め込みURL形式: ライブ配信の場合
    // https://twitcasting.tv/ユーザーID/embeddedplayer/live
    return `https://twitcasting.tv/${encodeURIComponent(userId)}/embeddedplayer/live`;
  }
  return '';
};

