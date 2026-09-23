import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CollaboratorPresence {
  clientId: number;
  name: string;
  color: string;
}

export interface CollaboratorSummary {
  _id: string;
  username: string;
  email?: string;
}

interface CollaborationState {
  rooms: Record<string, CollaboratorPresence[]>;
  books: Record<string, CollaboratorSummary[]>;
}

const initialState: CollaborationState = { rooms: {}, books: {} };

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setRoomPresence: (state, action: PayloadAction<{ room: string; users: CollaboratorPresence[] }>) => {
      state.rooms[action.payload.room] = action.payload.users;
    },
    clearRoomPresence: (state, action: PayloadAction<string>) => {
      delete state.rooms[action.payload];
    },
    setBookCollaborators: (state, action: PayloadAction<{ bookId: string; collaborators: CollaboratorSummary[] }>) => {
      state.books[action.payload.bookId] = action.payload.collaborators;
    },
  },
});

export const { setRoomPresence, clearRoomPresence, setBookCollaborators } = collaborationSlice.actions;
export default collaborationSlice.reducer;