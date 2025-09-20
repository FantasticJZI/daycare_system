import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { elderlyAPI } from '../../utils/api';

export interface Elderly {
  _id: string;
  name: string;
  idNumber: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  photo?: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }>;
  medicalInfo: {
    bloodType: string;
    allergies: Array<{
      allergen: string;
      severity: string;
      notes: string;
    }>;
    chronicDiseases: Array<{
      disease: string;
      diagnosisDate: string;
      severity: string;
      notes: string;
    }>;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
      endDate?: string;
      notes: string;
    }>;
    doctor: {
      name: string;
      hospital: string;
      phone: string;
      specialty: string;
    };
  };
  careNeeds: {
    mobility: string;
    cognitive: string;
    dailyActivities: {
      bathing: string;
      dressing: string;
      eating: string;
      toileting: string;
    };
    specialNeeds: string[];
    dietaryRestrictions: string[];
    mobilityAids: string[];
  };
  longTermCareAssessment: {
    assessmentDate: string;
    assessor: string;
    adlScore: number;
    iadlScore: number;
    mmseScore: number;
    careLevel: string;
    carePlan: string;
    reviewDate: string;
  };
  familyMembers: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
    relationship: string;
    isPrimary: boolean;
    canViewHealthData: boolean;
    canReceiveNotifications: boolean;
  }>;
  serviceStatus: 'active' | 'suspended' | 'terminated' | 'waiting';
  serviceStartDate?: string;
  serviceEndDate?: string;
  fees: {
    monthlyFee: number;
    mealFee: number;
    transportFee: number;
    otherFees: Array<{
      name: string;
      amount: number;
      frequency: string;
    }>;
  };
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ElderlyState {
  elderly: Elderly[];
  currentElderly: Elderly | null;
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

const initialState: ElderlyState = {
  elderly: [],
  currentElderly: null,
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
export const fetchElderly = createAsyncThunk(
  'elderly/fetchElderly',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取長者列表失敗');
    }
  }
);

export const fetchElderlyById = createAsyncThunk(
  'elderly/fetchElderlyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.getById(id);
      return response.data.elderly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取長者資料失敗');
    }
  }
);

export const createElderly = createAsyncThunk(
  'elderly/createElderly',
  async (elderlyData: any, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.create(elderlyData);
      return response.data.elderly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '建立長者資料失敗');
    }
  }
);

export const updateElderly = createAsyncThunk(
  'elderly/updateElderly',
  async ({ id, elderlyData }: { id: string; elderlyData: any }, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.update(id, elderlyData);
      return response.data.elderly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新長者資料失敗');
    }
  }
);

export const deleteElderly = createAsyncThunk(
  'elderly/deleteElderly',
  async (id: string, { rejectWithValue }) => {
    try {
      await elderlyAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除長者資料失敗');
    }
  }
);

export const fetchElderlyStats = createAsyncThunk(
  'elderly/fetchElderlyStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取長者統計失敗');
    }
  }
);

export const addFamilyMember = createAsyncThunk(
  'elderly/addFamilyMember',
  async ({ elderlyId, memberData }: { elderlyId: string; memberData: any }, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.addFamilyMember(elderlyId, memberData);
      return response.data.elderly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '新增家屬失敗');
    }
  }
);

export const removeFamilyMember = createAsyncThunk(
  'elderly/removeFamilyMember',
  async ({ elderlyId, memberId }: { elderlyId: string; memberId: string }, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.removeFamilyMember(elderlyId, memberId);
      return response.data.elderly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '移除家屬失敗');
    }
  }
);

export const updateCareAssessment = createAsyncThunk(
  'elderly/updateCareAssessment',
  async ({ id, assessmentData }: { id: string; assessmentData: any }, { rejectWithValue }) => {
    try {
      const response = await elderlyAPI.updateCareAssessment(id, assessmentData);
      return response.data.elderly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新長照評估失敗');
    }
  }
);

const elderlySlice = createSlice({
  name: 'elderly',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentElderly: (state) => {
      state.currentElderly = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Elderly
      .addCase(fetchElderly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElderly.fulfilled, (state, action) => {
        state.loading = false;
        state.elderly = action.payload.elderly;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchElderly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Elderly By ID
      .addCase(fetchElderlyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElderlyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentElderly = action.payload;
        state.error = null;
      })
      .addCase(fetchElderlyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Elderly
      .addCase(createElderly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createElderly.fulfilled, (state, action) => {
        state.loading = false;
        state.elderly.unshift(action.payload);
        state.error = null;
      })
      .addCase(createElderly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Elderly
      .addCase(updateElderly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateElderly.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.elderly.findIndex(elderly => elderly._id === action.payload._id);
        if (index !== -1) {
          state.elderly[index] = action.payload;
        }
        if (state.currentElderly?._id === action.payload._id) {
          state.currentElderly = action.payload;
        }
        state.error = null;
      })
      .addCase(updateElderly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Elderly
      .addCase(deleteElderly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteElderly.fulfilled, (state, action) => {
        state.loading = false;
        state.elderly = state.elderly.filter(elderly => elderly._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteElderly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchElderlyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElderlyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchElderlyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Family Member
      .addCase(addFamilyMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentElderly?._id === action.payload._id) {
          state.currentElderly = action.payload;
        }
        state.error = null;
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove Family Member
      .addCase(removeFamilyMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentElderly?._id === action.payload._id) {
          state.currentElderly = action.payload;
        }
        state.error = null;
      })
      .addCase(removeFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Care Assessment
      .addCase(updateCareAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCareAssessment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentElderly?._id === action.payload._id) {
          state.currentElderly = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCareAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentElderly } = elderlySlice.actions;
export default elderlySlice.reducer;

