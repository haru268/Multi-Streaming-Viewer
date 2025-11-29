import React from 'react';
import styles from './TermsOfService.module.css';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>利用規約について</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.intro}>
            このマルチ配信ビューアは、YouTube、Twitch、ツイキャスの各プラットフォームの利用規約を遵守して開発・運営されています。
          </p>

          <div className={styles.warningSection}>
            <h3 className={styles.warningTitle}>⚠️ 音声再生について</h3>
            <p className={styles.warningText}>
              複数の配信を同時に視聴する際は、同時に音声を再生しないようご注意ください。
              1つの配信の音声をONにすると、他の配信は自動的にミュートになりますが、
              ご自身でも音声の重複再生に気を付けてご利用ください。
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🔊 音量調整について</h3>
            <p className={styles.description}>
              各動画の音量は、動画画面の下に表示されている音量コントロールで調整できます。
            </p>
            <div className={styles.volumeGuide}>
              <div className={styles.volumeGuideImage}>
                <div className={styles.volumeControlDemo}>
                  <button className={styles.volumeButtonDemo}>🔊</button>
                  <div className={styles.volumeSliderDemo}>
                    <div className={styles.volumeSliderTrack}></div>
                    <div className={styles.volumeSliderThumb}></div>
                  </div>
                  <span className={styles.volumeValueDemo}>50%</span>
                </div>
              </div>
              <div className={styles.volumeGuideSteps}>
                <p className={styles.volumeGuideText}>
                  <strong>音量調整の方法：</strong>
                </p>
                <ol className={styles.volumeGuideList}>
                  <li>音量ボタン（🔊/🔇）をクリックしてミュートのON/OFFを切り替えます</li>
                  <li>音量スライダーを左右に動かして音量を0%から100%まで調整します</li>
                  <li>現在の音量はスライダーの右側にパーセンテージで表示されます</li>
                  <li>ミュート時はスライダーが無効化され、音量は0%と表示されます</li>
                </ol>
                <p className={styles.volumeGuideNote}>
                  <strong>注意：</strong>YouTubeの動画は音量スライダーで直接調整できますが、
                  Twitchやツイキャスの動画は、各プラットフォームのプレイヤー内で音量を調整してください。
                </p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>YouTube利用規約</h3>
            <p className={styles.description}>
              YouTubeの利用規約に従い、本アプリケーションはYouTubeの埋め込みプレーヤーAPIを使用して配信を表示しています。
            </p>
            <a
              href="https://www.youtube.com/static?template=terms"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              YouTube利用規約を確認する →
            </a>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Twitch利用規約</h3>
            <p className={styles.description}>
              Twitchの利用規約に従い、本アプリケーションはTwitchの埋め込みプレーヤーを使用して配信を表示しています。
            </p>
            <a
              href="https://www.twitch.tv/p/ja-jp/legal/terms-of-service/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Twitch利用規約を確認する →
            </a>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>ツイキャス利用規約</h3>
            <p className={styles.description}>
              ツイキャスの利用規約に従い、本アプリケーションはツイキャスの埋め込みプレーヤーを使用して配信を表示しています。
            </p>
            <a
              href="https://twitcasting.tv/terms.php"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              ツイキャス利用規約を確認する →
            </a>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              本アプリケーションを使用する際は、各プラットフォームの利用規約を遵守してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

