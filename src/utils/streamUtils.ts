import { Platform } from '../types';

export const extractStreamId = (url: string, platform: Platform): string => {
  if (!url) return '';

  if (platform === 'youtube') {
    // YouTube URL形式の全パターンをサポート
    // 1. https://www.youtube.com/watch?v=VIDEO_ID (標準形式)
    // 2. https://youtube.com/watch?v=VIDEO_ID (wwwなし)
    // 3. https://m.youtube.com/watch?v=VIDEO_ID (モバイル版)
    // 4. https://youtu.be/VIDEO_ID (短縮URL)
    // 5. https://www.youtube.com/live/VIDEO_ID (ライブ配信)
    // 6. https://www.youtube.com/embed/VIDEO_ID (埋め込みURL)
    // 7. https://www.youtube.com/v/VIDEO_ID (古い形式)
    // 8. https://www.youtube.com/shorts/VIDEO_ID (ショート動画)
    // 9. https://www.youtube.com/watch?feature=share&v=VIDEO_ID (共有リンク)
    // 10. VIDEO_ID (直接IDの場合)
    
    let cleanedUrl = url.trim();
    
    // URLパラメータやフラグメントを除去してから処理
    cleanedUrl = cleanedUrl.split('#')[0];
    
    // パターン1-3: watch?v=VIDEO_ID 形式（www、m、なしすべて対応）
    let match = cleanedUrl.match(/(?:youtube\.com|m\.youtube\.com)\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11,})/);
    if (match) {
      return match[1].split('&')[0].split('?')[0]; // 追加パラメータを除去
    }
    
    // パターン4: youtu.be/VIDEO_ID 形式
    match = cleanedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11,})/);
    if (match) {
      return match[1].split('?')[0].split('&')[0]; // 追加パラメータを除去
    }
    
    // パターン5: /live/VIDEO_ID 形式
    match = cleanedUrl.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11,})/);
    if (match) {
      return match[1].split('?')[0].split('&')[0];
    }
    
    // パターン6: /embed/VIDEO_ID 形式
    match = cleanedUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11,})/);
    if (match) {
      return match[1].split('?')[0].split('&')[0];
    }
    
    // パターン7: /v/VIDEO_ID 形式
    match = cleanedUrl.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11,})/);
    if (match) {
      return match[1].split('?')[0].split('&')[0];
    }
    
    // パターン8: /shorts/VIDEO_ID 形式
    match = cleanedUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11,})/);
    if (match) {
      return match[1].split('?')[0].split('&')[0];
    }
    
    // パターン10: 直接VIDEO_ID（11文字以上の英数字、ハイフン、アンダースコア）
    // URL形式でない場合のみ
    if (!cleanedUrl.includes('youtube.com') && !cleanedUrl.includes('youtu.be')) {
      const directIdMatch = cleanedUrl.match(/^([a-zA-Z0-9_-]{11,})$/);
      if (directIdMatch) {
        return directIdMatch[1];
      }
    }
    
    // どのパターンにも一致しない場合は元のURLを返す
    return url;
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
    // または: https://twitcasting.tv/c:USER_ID (c:で始まる形式)
    // または: @USER_ID または USER_ID (直接ユーザーIDの場合)
    // @記号を除去
    let cleanedUrl = url.replace(/^@/, '').trim();
    
    // URL形式の場合、パスからユーザーIDを抽出
    // c:で始まる形式もサポート（例: c:daasuu7sub）
    if (cleanedUrl.includes('twitcasting.tv/')) {
      // スラッシュ以降の最初の部分を取得（URLパラメータやフラグメントを除外）
      const urlMatch = cleanedUrl.match(/twitcasting\.tv\/([^\/\?\#]+)/);
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
      if (userId) {
        return userId;
      }
    }
    
    // そのまま返す（既にユーザーIDのみの場合、c:形式も含む）
    // URLパラメータやフラグメントを除去
    return cleanedUrl.split('?')[0].split('#')[0].trim();
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
    let cleanStreamId = streamId.replace(/^@/, '').trim();
    // URLパラメータやフラグメントを除去
    cleanStreamId = cleanStreamId.split('?')[0].split('#')[0].trim();
    if (!cleanStreamId) return '';
    // ツイキャスの正しい埋め込みURL形式: ライブ配信の場合
    // https://twitcasting.tv/ユーザーID/embeddedplayer/live
    // c:で始まる形式（例: c:daasuu7sub）もサポート
    return `https://twitcasting.tv/${encodeURIComponent(cleanStreamId)}/embeddedplayer/live`;
  }
  return '';
};

