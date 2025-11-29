export type Platform = 'youtube' | 'twitch' | 'twitcasting';

/**
 * ストリームスロットの型定義
 * 
 * 規約遵守に関する重要な注意事項:
 * - isMuted: 初期状態は必ずtrue（全枠ミュートで自動再生）
 * - 音声ONはユーザーの明示的な操作のみで許可
 * - プレイヤーの改変は一切行わない
 */
export interface StreamSlot {
  id: string;
  platform: Platform | null;
  url: string;
  streamId: string;
  teamName: string;
  isMuted: boolean; // 規約遵守: デフォルトはtrue（ミュート状態）
  volume: number; // 音量 (0-100)
  isMain: boolean;
}

export interface AppSettings {
  slots: StreamSlot[];
  columns: 2 | 3 | 4;
}

