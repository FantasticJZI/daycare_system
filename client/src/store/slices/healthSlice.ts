import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthAPI } from '../../utils/api';

export interface HealthRecord {
  _id: string;
  elderly: string;
  recordType: 'vital_signs' | 'medication' | 'symptom' | 'incident' | 'assessment' | 'doctor_visit';
  recordDate: string;
  recordedBy: {
    _id: string;
    name: string;
    role: string;
  };
  vitalSigns?: {
    bloodPressure?: {
      systolic: number;
      diastolic: number;
      unit: string;
    };
    heartRate?: {
      value: number;
      unit: string;
    };
    temperature?: {
      value: number;
      unit: string;
    };
    bloodSugar?: {
      value: number;
      unit: string;
      type: string;
    };
    oxygenSaturation?: {
      value: number;
      unit: string;
    };
    weight?: {
      value: number;
      unit: string;
    };
    height?: {
      value: number;
      unit: string;
    };
  };
  medication?: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    givenBy: string;
    givenAt: string;
    notes: string;
  };
  symptoms?: Array<{
    symptom: string;
    severity: string;
    duration: string;
    description: string;
  }>;
  incident?: {
    type: string;
    description: string;
    location: string;
    severity: string;
    actionTaken: string;
    followUpRequired: boolean;
    followUpNotes: string;
  };
  assessment?: {
    type: string;
    score: number;
    maxScore: number;
    notes: string;
    recommendations: string;
  };
  doctorVisit?: {
    doctor: string;
    diagnosis: string;
    treatment: string;
    followUpDate: string;
    notes: string;
    prescriptions: Array<{
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
  };
  notes?: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  status: 'draft' | 'completed' | 'reviewed' | 'archived';
  reviewedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  notifyFamily: boolean;
  notifyDoctor: boolean;
  notificationSent: boolean;
  isAbnormal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HealthState {
  healthRecords: HealthRecord[];
  currentHealthRecord: HealthRecord | null;
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

const initialState: HealthState = {
  healthRecords: [],
  currentHealthRecord: null,
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
export const fetchHealthRecords = createAsyncThunk(
  'health/fetchHealthRecords',
  async ({ elderlyId, params = {} }: { elderlyId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await healthAPI.getByElderly(elderlyId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取健康記錄失敗');
    }
  }
);

export const fetchHealthRecordById = createAsyncThunk(
  'health/fetchHealthRecordById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await healthAPI.getById(id);
      return response.data.healthRecord;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取健康記錄失敗');
    }
  }
);

export const createHealthRecord = createAsyncThunk(
  'health/createHealthRecord',
  async (healthData: any, { rejectWithValue }) => {
    try {
      const response = await healthAPI.create(healthData);
      return response.data.healthRecord;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '建立健康記錄失敗');
    }
  }
);

export const updateHealthRecord = createAsyncThunk(
  'health/updateHealthRecord',
  async ({ id, healthData }: { id: string; healthData: any }, { rejectWithValue }) => {
    try {
      const response = await healthAPI.update(id, healthData);
      return response.data.healthRecord;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新健康記錄失敗');
    }
  }
);

export const deleteHealthRecord = createAsyncThunk(
  'health/deleteHealthRecord',
  async (id: string, { rejectWithValue }) => {
    try {
      await healthAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除健康記錄失敗');
    }
  }
);

export const reviewHealthRecord = createAsyncThunk(
  'health/reviewHealthRecord',
  async ({ id, reviewData }: { id: string; reviewData: any }, { rejectWithValue }) => {
    try {
      const response = await healthAPI.review(id, reviewData);
      return response.data.healthRecord;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '審核健康記錄失敗');
    }
  }
);

export const fetchHealthStats = createAsyncThunk(
  'health/fetchHealthStats',
  async ({ elderlyId, params = {} }: { elderlyId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await healthAPI.getStats(elderlyId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取健康統計失敗');
    }
  }
);

export const fetchAbnormalHealthRecords = createAsyncThunk(
  'health/fetchAbnormalHealthRecords',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await healthAPI.getAbnormal(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取異常健康記錄失敗');
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentHealthRecord: (state) => {
      state.currentHealthRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Health Records
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.healthRecords = action.payload.healthRecords;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Health Record By ID
      .addCase(fetchHealthRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHealthRecord = action.payload;
        state.error = null;
      })
      .addCase(fetchHealthRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Health Record
      .addCase(createHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.healthRecords.unshift(action.payload);
        state.error = null;
      })
      .addCase(createHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Health Record
      .addCase(updateHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.healthRecords.findIndex(record => record._id === action.payload._id);
        if (index !== -1) {
          state.healthRecords[index] = action.payload;
        }
        if (state.currentHealthRecord?._id === action.payload._id) {
          state.currentHealthRecord = action.payload;
        }
        state.error = null;
      })
      .addCase(updateHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Health Record
      .addCase(deleteHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.healthRecords = state.healthRecords.filter(record => record._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Review Health Record
      .addCase(reviewHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.healthRecords.findIndex(record => record._id === action.payload._id);
        if (index !== -1) {
          state.healthRecords[index] = action.payload;
        }
        if (state.currentHealthRecord?._id === action.payload._id) {
          state.currentHealthRecord = action.payload;
        }
        state.error = null;
      })
      .addCase(reviewHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchHealthStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchHealthStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Abnormal Health Records
      .addCase(fetchAbnormalHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAbnormalHealthRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.healthRecords = action.payload.healthRecords;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAbnormalHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentHealthRecord } = healthSlice.actions;
export default healthSlice.reducer;

