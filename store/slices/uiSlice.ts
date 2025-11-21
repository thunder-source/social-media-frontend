import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isMuted: boolean;
}

// Helper to safely get initial state from localStorage
const getInitialMuteState = (): boolean => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('social-media-mute');
    return stored !== null ? stored === 'true' : true; // Default to muted
  }
  return true;
};

const initialState: UiState = {
  isMuted: true, // Default to true to avoid autoplay with sound
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('social-media-mute', String(action.payload));
      }
    },
    toggleMuted: (state) => {
      state.isMuted = !state.isMuted;
      if (typeof window !== 'undefined') {
        localStorage.setItem('social-media-mute', String(state.isMuted));
      }
    },
    // Action to sync state with localStorage after mount
    initializeAudioState: (state) => {
        const stored = localStorage.getItem('social-media-mute');
        if (stored !== null) {
            state.isMuted = stored === 'true';
        }
    }
  },
});

export const { setMuted, toggleMuted, initializeAudioState } = uiSlice.actions;
export default uiSlice.reducer;
