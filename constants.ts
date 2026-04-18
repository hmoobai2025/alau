import { FeatureKey } from './types';

export const UI_STYLES: string[] = [
  'Phong cách 3D dễ thương',
  '3D Anime',
  'Phong cách rực rỡ',
  'Minh họa 2D',
  'Giao diện người dùng 3D',
  'Nghệ thuật Pixel',
  'Thiết kế phẳng tối giản',
];

export const FEATURES_CONFIG: { key: FeatureKey; label: string }[] = [
  { key: 'studentName', label: 'Nhập tên người chơi' },
  { key: 'leaderboard', label: 'Bảng xếp hạng' },
  { key: 'soundEffects', label: 'Hiệu ứng âm thanh' },
  { key: 'backgroundMusic', label: 'Nhạc nền' },
  { key: 'musicToggle', label: 'Bật/Tắt nhạc' },
  { key: 'localStorage', label: 'Lưu dữ liệu' },
  { key: 'disableRightClick', label: 'Vô hiệu hóa chuột phải' },
  { key: 'disableF12', label: 'Vô hiệu hóa F12' },
  { key: 'obfuscateCode', label: 'Làm rối mã nguồn' },
];
