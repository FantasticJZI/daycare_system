import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceAPI } from '../../utils/api';

export interface Attendance {
  _id: string;
  elderly: {
    _id: string;
    name: string;
    idNumber: string;
    photo?: string;
  };
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'sick_leave' | 'personal_leave';
  checkIn?: {
    time: string;
    location: string;
    recordedBy: string;
    method: string;
    notes: string;
  };
  checkOut?: {
    time: string;
    location: string;
    recordedBy: string;
    method: string;
    notes: string;
  };
  leaveRequest?: {
    type: string;
    reason: string;
    startDate: string;
    endDate: string;
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
  transportation?: {
    pickup: {
      time: string;
      driver: string;
      vehicle: string;
      notes: string;
    };
    dropoff: {
      time: string;
      driver: string;
      vehicle: string;
      notes: string;
    };
  };
  activities: Array<{
    activity: string;
    startTime: string;
    endTime: string;
    participation: 'full' | 'partial' | 'absent';
    notes: string;
  }>;
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    time: string;
    status: 'eaten' | 'partial' | 'refused' | 'not_served';
    specialDiet: string;
    notes: string;
  }>;
  careRecords: Array<{
    type: 'medication' | 'bathroom_assistance' | 'mobility_assistance' | 'feeding_assistance' | 'other';
    time: string;
    caregiver: string;
    description: string;
    duration: number;
    notes: string;
  }>;
  healthStatus: {
    general: 'excellent' | 'good' | 'fair' | 'poor';
    mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
    energy: 'very_high' | 'high' | 'normal' | 'low' | 'very_low';
    sleep: 'excellent' | 'good' | 'fair' | 'poor';
    appetite: 'excellent' | 'good' | 'fair' | 'poor';
  };
  incidents: Array<{
    type: 'fall' | 'injury' | 'behavioral' | 'medical' | 'other';
    time: string;
    description: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    actionTaken: string;
    reportedBy: string;
    followUpRequired: boolean;
  }>;
  familyNotifications: Array<{
    type: 'check_in' | 'check_out' | 'incident' | 'health_concern' | 'activity_update';
    sentAt: string;
    sentTo: string[];
    message: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }>;
  notes?: string;
  createdBy: string;
  lastModifiedBy?: string;
  totalHours: number;
  isLate: boolean;
  isEarlyLeave: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceState {
  attendance: Attendance[];
  currentAttendance: Attendance | null;
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

const initialState: AttendanceState = {
  attendance: [],
  currentAttendance: null,
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
export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取出勤記錄失敗');
    }
  }
);

export const fetchAttendanceById = createAsyncThunk(
  'attendance/fetchAttendanceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getById(id);
      return response.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取出勤記錄失敗');
    }
  }
);

export const createAttendance = createAsyncThunk(
  'attendance/createAttendance',
  async (attendanceData: any, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.create(attendanceData);
      return response.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '建立出勤記錄失敗');
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, attendanceData }: { id: string; attendanceData: any }, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.update(id, attendanceData);
      return response.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新出勤記錄失敗');
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id: string, { rejectWithValue }) => {
    try {
      await attendanceAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除出勤記錄失敗');
    }
  }
);

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async ({ elderlyId, checkInData }: { elderlyId: string; checkInData: any }, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.checkIn(elderlyId, checkInData);
      return response.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '打卡失敗');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async ({ elderlyId, checkOutData }: { elderlyId: string; checkOutData: any }, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.checkOut(elderlyId, checkOutData);
      return response.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '簽退失敗');
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getStats(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取出勤統計失敗');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAttendance: (state) => {
      state.currentAttendance = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload.attendance;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Attendance By ID
      .addCase(fetchAttendanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
        state.error = null;
      })
      .addCase(fetchAttendanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Attendance
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendance.findIndex(attendance => attendance._id === action.payload._id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        if (state.currentAttendance?._id === action.payload._id) {
          state.currentAttendance = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = state.attendance.filter(attendance => attendance._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendance.findIndex(attendance => attendance._id === action.payload._id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        } else {
          state.attendance.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendance.findIndex(attendance => attendance._id === action.payload._id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;

