import React, { useRef, useEffect } from 'react';
import { StreamSlot as StreamSlotType, Platform } from '../types';
import { getEmbedUrl } from '../utils/streamUtils';
import styles from './StreamSlot.module.css';

interface StreamSlotProps {
  slot: StreamSlotType;
  index: number;
  columns: 2 | 3 | 4;
  isDragging: boolean;
  onMuteToggle: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const StreamSlot: React.FC<StreamSlotProps> = ({
  slot,
  index,
  columns,
  isDragging,
  onMuteToggle,
  onVolumeChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  // YouTube IFrame APIの初期化
  useEffect(() => {
    if (slot.platform === 'youtube' && slot.streamId) {
      const initYouTubePlayer = () => {
        if (window.YT && window.YT.Player) {
          if (playerRef.current) {
            try {
              playerRef.current.destroy();
            } catch (e) {
              // プレイヤーが既に破棄されている場合
            }
          }

          const playerId = `youtube-player-${slot.id}`;
          const playerElement = document.getElementById(playerId);
          
          if (playerElement) {
            playerRef.current = new window.YT.Player(playerId, {
              videoId: slot.streamId,
              playerVars: {
                autoplay: 1,
                mute: slot.isMuted ? 1 : 0,
                enablejsapi: 1,
              },
              events: {
                onReady: (event: any) => {
                  if (event.target) {
                    event.target.setVolume(slot.volume);
                  }
                },
              },
            });
          }
        }
      };

      // YouTube IFrame APIが既に読み込まれている場合
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
      } else {
        // YouTube IFrame APIが読み込まれるまで待つ
        const checkYT = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkYT);
            initYouTubePlayer();
          }
        }, 100);

        // タイムアウト（10秒）
        setTimeout(() => {
          clearInterval(checkYT);
        }, 10000);

        return () => {
          clearInterval(checkYT);
        };
      }

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // プレイヤーが既に破棄されている場合
          }
        }
      };
    }
  }, [slot.platform, slot.streamId, slot.id]);

  // 音量変更の反映（YouTube IFrame API使用時）
  useEffect(() => {
    if (slot.platform === 'youtube' && playerRef.current && !slot.isMuted) {
      try {
        playerRef.current.setVolume(slot.volume);
      } catch (e) {
        // プレイヤーが準備できていない場合
      }
    }
  }, [slot.volume, slot.platform, slot.isMuted]);

  // ミュート状態の反映
  useEffect(() => {
    if (slot.platform === 'youtube' && playerRef.current) {
      try {
        if (slot.isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(slot.volume);
        }
      } catch (e) {
        // プレイヤーが準備できていない場合
      }
    } else if (slot.platform !== 'youtube' && iframeRef.current && slot.platform && slot.streamId) {
      // YouTube以外は通常の埋め込みURLを使用
      const embedUrl = getEmbedUrl(slot.streamId, slot.platform, slot.isMuted);
      if (embedUrl) {
        iframeRef.current.src = embedUrl;
      }
    }
  }, [slot.platform, slot.streamId, slot.isMuted]);

  const handleMuteToggle = () => {
    onMuteToggle(slot.id);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    onVolumeChange(slot.id, newVolume);
    
    // YouTube IFrame APIで音量を即座に反映
    if (slot.platform === 'youtube' && playerRef.current && !slot.isMuted) {
      try {
        playerRef.current.setVolume(newVolume);
      } catch (e) {
        // プレイヤーが準備できていない場合
      }
    }
  };

  const getPlatformName = (platform: Platform | null): string => {
    switch (platform) {
      case 'youtube':
        return 'YouTube';
      case 'twitch':
        return 'Twitch';
      case 'twitcasting':
        return 'TwitCasting';
      default:
        return '';
    }
  };

  const embedUrl = slot.platform && slot.streamId 
    ? getEmbedUrl(slot.streamId, slot.platform, slot.isMuted)
    : '';

  const handleRemove = () => {
    onRemove(slot.id);
  };

  const handleDragStartLocal = (e: React.DragEvent) => {
    onDragStart(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOverLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(e, index);
  };

  return (
    <div 
      className={`${styles.slotWrapper} ${isDragging ? styles.draggingWrapper : ''}`}
      draggable
      onDragStart={handleDragStartLocal}
      onDragOver={handleDragOverLocal}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div
        className={`${styles.slot} ${styles[`cols-${columns}`]} ${isDragging ? styles.dragging : ''}`}
      >
        {embedUrl && (
          <button
            className={styles.removeButton}
            onClick={handleRemove}
            onMouseDown={(e) => e.stopPropagation()}
            title="ストリームを削除"
          >
            ×
          </button>
        )}
        {embedUrl ? (
          // 規約遵守: 公式埋め込みプレイヤーをそのまま使用
          // YouTube IFrame APIを使用して音量制御（公式APIの範囲内）
          slot.platform === 'youtube' ? (
            <div
              id={`youtube-player-${slot.id}`}
              className={styles.iframe}
            />
          ) : (
            <iframe
              ref={iframeRef}
              className={styles.iframe}
              src={embedUrl}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={`${slot.platform} stream ${slot.id}`}
              style={{
                minWidth: '100%',
                minHeight: '100%',
                display: 'block',
              }}
            />
          )
        ) : (
          <div className={styles.placeholder}>
            <p>ストリームを追加</p>
          </div>
        )}
      </div>
      
      <div className={styles.infoBar}>
        <div className={styles.infoText}>
          {slot.teamName && (
            <span className={styles.teamName}>{slot.teamName}</span>
          )}
          {slot.platform && (
            <span className={styles.platform}>
              {getPlatformName(slot.platform)}
            </span>
          )}
        </div>
        <div className={styles.controls}>
          {embedUrl && (
            <div className={styles.volumeControl}>
              <button
                className={styles.button}
                onClick={handleMuteToggle}
                onMouseDown={(e) => e.stopPropagation()}
                title={slot.isMuted ? 'ミュート解除' : 'ミュート'}
              >
                {slot.isMuted ? '🔇' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={slot.isMuted ? 0 : slot.volume}
                onChange={handleVolumeChange}
                onMouseDown={(e) => e.stopPropagation()}
                className={styles.volumeSlider}
                title={`音量: ${slot.volume}%`}
                disabled={slot.isMuted}
              />
              <span className={styles.volumeValue}>
                {slot.isMuted ? '0' : slot.volume}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

