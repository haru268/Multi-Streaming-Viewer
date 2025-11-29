import { AppSettings } from '../types';

const STORAGE_KEY = 'multi-stream-viewer-settings';

/**
 * 設定をローカルストレージに保存
 * 
 * 規約遵守: 保存された設定を読み込む際も、新規追加分は必ずミュート状態にする
 * 詳細は App.tsx の useEffect を参照
 */
export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

/**
 * 設定をローカルストレージから読み込み
 * 
 * 規約遵守: 読み込んだ設定でも、新規追加分は必ずミュート状態にする
 * 詳細は App.tsx の useEffect を参照
 */
export const loadSettings = (): AppSettings | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return null;
};

