import React from 'react';
import { Platform } from '../types';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  selectedPlatform: Platform | null;
  onPlatformChange: (platform: Platform | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  teamName: string;
  onTeamNameChange: (teamName: string) => void;
  onApply: () => void;
  onAddSlot: () => void;
  onSaveSettings: () => void;
  columns: 2 | 3 | 4;
  onColumnsChange: (columns: 2 | 3 | 4) => void;
  slotCount: number;
  maxSlots: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedPlatform,
  onPlatformChange,
  url,
  onUrlChange,
  teamName,
  onTeamNameChange,
  onApply,
  onAddSlot,
  onSaveSettings,
  columns,
  onColumnsChange,
  slotCount,
  maxSlots,
}) => {
  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <label className={styles.label}>プラットフォーム</label>
        <select
          className={styles.select}
          value={selectedPlatform || ''}
          onChange={(e) => onPlatformChange(e.target.value as Platform | null)}
        >
          <option value="">選択してください</option>
          <option value="youtube">YouTube</option>
          <option value="twitch">Twitch</option>
          <option value="twitcasting">ツイキャス</option>
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>URLまたはID</label>
        <input
          type="text"
          className={styles.input}
          placeholder="YouTube URL / Twitch チャンネル名 / ツイキャス ユーザーID"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onApply()}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>チーム名（オプション）</label>
        <input
          type="text"
          className={styles.input}
          placeholder="チーム名を入力"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onApply()}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>レイアウト</label>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.layoutButton} ${columns === 2 ? styles.active : ''}`}
            onClick={() => onColumnsChange(2)}
          >
            2列
          </button>
          <button
            className={`${styles.layoutButton} ${columns === 3 ? styles.active : ''}`}
            onClick={() => onColumnsChange(3)}
          >
            3列
          </button>
          <button
            className={`${styles.layoutButton} ${columns === 4 ? styles.active : ''}`}
            onClick={() => onColumnsChange(4)}
          >
            4列
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <button className={styles.button} onClick={onApply}>
          適用
        </button>
        <button
          className={styles.button}
          onClick={onAddSlot}
          disabled={slotCount >= maxSlots}
        >
          枠を追加 ({slotCount}/{maxSlots})
        </button>
        <button className={styles.button} onClick={onSaveSettings}>
          設定を保存
        </button>
      </div>
    </div>
  );
};

