
export interface Features {
  studentName: boolean;
  leaderboard: boolean;
  soundEffects: boolean;
  backgroundMusic: boolean;
  musicToggle: boolean;
  localStorage: boolean;
  disableRightClick: boolean;
  disableF12: boolean;
  obfuscateCode: boolean;
}

export type FeatureKey = keyof Features;

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}
