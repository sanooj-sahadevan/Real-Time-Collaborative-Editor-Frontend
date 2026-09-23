import { configureStore } from '@reduxjs/toolkit';
import collaborationReducer from './collaborationSlice';

export const store = configureStore({
  reducer: { collaboration: collaborationReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;