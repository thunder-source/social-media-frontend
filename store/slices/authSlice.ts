import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  onlineUsers: string[];
}

const initialState: AuthState = {
  onlineUsers: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    setUserOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    setUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
  },
});

export const { setOnlineUsers, setUserOnline, setUserOffline } = authSlice.actions;
export default authSlice.reducer;
