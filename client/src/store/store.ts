import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import elderlyReducer from './slices/elderlySlice';
import healthReducer from './slices/healthSlice';
import attendanceReducer from './slices/attendanceSlice';
import activityReducer from './slices/activitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    elderly: elderlyReducer,
    health: healthReducer,
    attendance: attendanceReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

