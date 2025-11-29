import { useState, useEffect, useCallback } from 'react';
import { StreamSlot, Platform, AppSettings } from './types';
import { StreamSlot as StreamSlotComponent } from './components/StreamSlot';
import { ControlPanel } from './components/ControlPanel';
import { TermsOfService } from './components/TermsOfService';
import { saveSettings, loadSettings } from './utils/storage';
import { extractStreamId } from './utils/streamUtils';
import styles from './App.module.css';

const MAX_SLOTS = 16;
const INITIAL_SLOTS = 9;

const createEmptySlot = (id: string): StreamSlot => ({
  id,
  platform: null,
  url: '',
  streamId: '',
  teamName: '',
  isMuted: true, // 規約遵守: 初期状態は必ずミュート
  volume: 50, // デフォルト音量50%
  isMain: false,
});

const createInitialSlots = (): StreamSlot[] => {
  return Array.from({ length: INITIAL_SLOTS }, (_, i) =>
    createEmptySlot(`slot-${i + 1}`)
  );
};

function App() {
  const [slots, setSlots] = useState<StreamSlot[]>(createInitialSlots());
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [url, setUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      // 規約遵守: 保存された設定を読み込む際も、念のためミュート状態を確認
      const loadedSlots = saved.slots.length > 0 
        ? saved.slots.map(slot => ({
            ...slot,
            // 保存された設定があっても、安全のため新規追加分はミュートにする
            isMuted: slot.platform && slot.streamId ? slot.isMuted : true,
            volume: slot.volume ?? 50, // 既存データにvolumeがない場合は50%に設定
          }))
        : createInitialSlots();
      setSlots(loadedSlots);
      setColumns(saved.columns || 3);
    }
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedPlatform || !url) {
      alert('プラットフォームとURLを入力してください');
      return;
    }

    const streamId = extractStreamId(url, selectedPlatform);
    if (!streamId) {
      alert('有効なURLまたはIDを入力してください');
      return;
    }

    setSlots((prevSlots) => {
      const emptySlotIndex = prevSlots.findIndex(
        (slot) => !slot.platform || !slot.streamId
      );

      if (emptySlotIndex === -1) {
        alert('すべての枠が使用中です。新しい枠を追加してください。');
        return prevSlots;
      }

      const newSlots = [...prevSlots];
      newSlots[emptySlotIndex] = {
        ...newSlots[emptySlotIndex],
        platform: selectedPlatform,
        url,
        streamId,
        teamName,
        isMuted: true, // 規約遵守: 新規追加時は必ずミュート
        volume: 50, // デフォルト音量50%
      };

      return newSlots;
    });

    setUrl('');
    setTeamName('');
    setSelectedPlatform(null);
  }, [selectedPlatform, url, teamName]);

  const handleAddSlot = useCallback(() => {
    if (slots.length >= MAX_SLOTS) {
      alert(`最大${MAX_SLOTS}枠まで追加可能です`);
      return;
    }

    setSlots((prevSlots) => [
      ...prevSlots,
      createEmptySlot(`slot-${prevSlots.length + 1}`),
    ]);
  }, [slots.length]);

  // 規約遵守: ミュートトグルはユーザーの明示的な操作のみで実行
  // 音声ONはユーザーがクリックした場合のみ許可（自動音声再生禁止）
  // 1つの動画の音声をONにしたら、他の動画は自動的にミュートにする
  const handleMuteToggle = useCallback((id: string) => {
    setSlots((prevSlots) => {
      const targetSlot = prevSlots.find(slot => slot.id === id);
      if (!targetSlot) return prevSlots;

      // ミュートを解除する場合（音声をONにする場合）
      if (targetSlot.isMuted) {
        // このスロットのミュートを解除し、他のすべてのスロットをミュートにする
        return prevSlots.map((slot) =>
          slot.id === id 
            ? { ...slot, isMuted: false }
            : { ...slot, isMuted: true }
        );
      } else {
        // ミュートにする場合は、そのスロットだけをミュートにする
        return prevSlots.map((slot) =>
          slot.id === id ? { ...slot, isMuted: true } : slot
        );
      }
    });
  }, []);

  const handleVolumeChange = useCallback((id: string, volume: number) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === id ? { ...slot, volume: Math.max(0, Math.min(100, volume)) } : slot
      )
    );
  }, []);

  const handleRemoveStream = useCallback((id: string) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === id ? createEmptySlot(id) : slot
      )
    );
  }, []);


  const handleSaveSettings = useCallback(() => {
    const settings: AppSettings = {
      slots,
      columns,
    };
    saveSettings(settings);
    alert('設定を保存しました');
  }, [slots, columns]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>マルチ配信ビューア</h1>
        <p className={styles.subtitle}>
          YouTube、Twitch、ツイキャスのライブ配信を同時に視聴
        </p>
        <button
          className={styles.termsButton}
          onClick={() => setIsTermsOpen(true)}
        >
          利用規約について
        </button>
      </header>

      <ControlPanel
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        url={url}
        onUrlChange={setUrl}
        teamName={teamName}
        onTeamNameChange={setTeamName}
        onApply={handleApply}
        onAddSlot={handleAddSlot}
        onSaveSettings={handleSaveSettings}
        columns={columns}
        onColumnsChange={setColumns}
        slotCount={slots.length}
        maxSlots={MAX_SLOTS}
      />

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {slots.map((slot) => (
          <StreamSlotComponent
            key={slot.id}
            slot={slot}
            columns={columns}
            onMuteToggle={handleMuteToggle}
            onVolumeChange={handleVolumeChange}
            onRemove={handleRemoveStream}
          />
        ))}
      </div>

      <TermsOfService
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}

export default App;

