import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityAPI } from '../../utils/api';

export interface Activity {
  _id: string;
  name: string;
  description?: string;
  type: 'physical' | 'cognitive' | 'social' | 'creative' | 'recreational' | 'educational' | 'therapeutic';
  category: 'exercise' | 'games' | 'arts_crafts' | 'music' | 'cooking' | 'gardening' | 'reading' | 'discussion' | 'outdoor' | 'other';
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    isRecurring: boolean;
    recurringPattern?: 'daily' | 'weekly' | 'monthly';
    recurringDays?: string[];
  };
  location: {
    name: string;
    room?: string;
    capacity: number;
  };
  staff: {
    leader: {
      _id: string;
      name: string;
      role: string;
    };
    assistants: Array<{
      _id: string;
      name: string;
      role: string;
    }>;
    volunteers: Array<{
      name: string;
      phone: string;
      email: string;
    }>;
  };
  participants: Array<{
    elderly: {
      _id: string;
      name: string;
      idNumber: string;
      photo?: string;
    };
    registeredAt: string;
    status: 'registered' | 'attended' | 'absent' | 'cancelled';
    notes?: string;
  }>;
  content: {
    objectives: string[];
    materials: string[];
    instructions: string;
    safetyNotes: string;
    adaptations: string;
  };
  healthConsiderations: {
    physicalRequirements: string[];
    cognitiveRequirements: string[];
    mobilityRequirements: string[];
    medicalRestrictions: string[];
    specialNeeds: string[];
  };
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  execution: {
    actualStartTime?: string;
    actualEndTime?: string;
    actualDuration?: number;
    attendanceCount: number;
    notes?: string;
    issues: string[];
    improvements: string[];
  };
  evaluation: {
    participantFeedback: Array<{
      elderly: {
        _id: string;
        name: string;
        photo?: string;
      };
      rating: number;
      comments: string;
      submittedAt: string;
    }>;
    staffFeedback: {
      rating: number;
      comments: string;
      submittedBy: string;
      submittedAt: string;
    };
    overallRating?: number;
    effectiveness?: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations?: string;
  };
  media: Array<{
    type: 'image' | 'video' | 'document';
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  cost: {
    materials: number;
    equipment: number;
    transportation: number;
    other: number;
    total: number;
  };
  isActive: boolean;
  notes?: string;
  isUpcoming: boolean;
  isOngoing: boolean;
  isPast: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ActivityState {
  activities: Activity[];
  currentActivity: Activity | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  stats: any;
}

const initialState: ActivityState = {
  activities: [],
  currentActivity: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  stats: null,
};

// 異步 actions
export const fetchActivities = createAsyncThunk(
  'activity/fetchActivities',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await activityAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取活動列表失敗');
    }
  }
);

export const fetchActivityById = createAsyncThunk(
  'activity/fetchActivityById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await activityAPI.getById(id);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取活動資料失敗');
    }
  }
);

export const createActivity = createAsyncThunk(
  'activity/createActivity',
  async (activityData: any, { rejectWithValue }) => {
    try {
      const response = await activityAPI.create(activityData);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '建立活動失敗');
    }
  }
);

export const updateActivity = createAsyncThunk(
  'activity/updateActivity',
  async ({ id, activityData }: { id: string; activityData: any }, { rejectWithValue }) => {
    try {
      const response = await activityAPI.update(id, activityData);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新活動失敗');
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activity/deleteActivity',
  async (id: string, { rejectWithValue }) => {
    try {
      await activityAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除活動失敗');
    }
  }
);

export const registerActivity = createAsyncThunk(
  'activity/registerActivity',
  async ({ id, registrationData }: { id: string; registrationData: any }, { rejectWithValue }) => {
    try {
      const response = await activityAPI.register(id, registrationData);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '報名活動失敗');
    }
  }
);

export const unregisterActivity = createAsyncThunk(
  'activity/unregisterActivity',
  async ({ id, participantId }: { id: string; participantId: string }, { rejectWithValue }) => {
    try {
      const response = await activityAPI.unregister(id, participantId);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消報名失敗');
    }
  }
);

export const updateParticipant = createAsyncThunk(
  'activity/updateParticipant',
  async ({ id, participantId, participantData }: { id: string; participantId: string; participantData: any }, { rejectWithValue }) => {
    try {
      const response = await activityAPI.updateParticipant(id, participantId, participantData);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新參與者狀態失敗');
    }
  }
);

export const startActivity = createAsyncThunk(
  'activity/startActivity',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await activityAPI.start(id);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '開始活動失敗');
    }
  }
);

export const endActivity = createAsyncThunk(
  'activity/endActivity',
  async ({ id, endData }: { id: string; endData: any }, { rejectWithValue }) => {
    try {
      const response = await activityAPI.end(id, endData);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '結束活動失敗');
    }
  }
);

export const evaluateActivity = createAsyncThunk(
  'activity/evaluateActivity',
  async ({ id, evaluationData }: { id: string; evaluationData: any }, { rejectWithValue }) => {
    try {
      const response = await activityAPI.evaluate(id, evaluationData);
      return response.data.activity;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '提交活動評估失敗');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'activity/fetchActivityStats',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await activityAPI.getStats(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取活動統計失敗');
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentActivity: (state) => {
      state.currentActivity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Activity By ID
      .addCase(fetchActivityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentActivity = action.payload;
        state.error = null;
      })
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities.unshift(action.payload);
        state.error = null;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Activity
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = state.activities.filter(activity => activity._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register Activity
      .addCase(registerActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(registerActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Unregister Activity
      .addCase(unregisterActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unregisterActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(unregisterActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Participant
      .addCase(updateParticipant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParticipant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(updateParticipant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Start Activity
      .addCase(startActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(startActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // End Activity
      .addCase(endActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(endActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Evaluate Activity
      .addCase(evaluateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(evaluateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity?._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.error = null;
      })
      .addCase(evaluateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentActivity } = activitySlice.actions;
export default activitySlice.reducer;

