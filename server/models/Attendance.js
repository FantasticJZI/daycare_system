const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // 關聯長者
  elderly: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elderly',
    required: [true, '長者ID為必填欄位']
  },
  
  // 出勤日期
  date: {
    type: Date,
    required: [true, '出勤日期為必填欄位']
  },
  
  // 出勤狀態
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early_leave', 'sick_leave', 'personal_leave'],
    required: [true, '出勤狀態為必填欄位']
  },
  
  // 打卡記錄
  checkIn: {
    time: Date,
    location: {
      type: String,
      enum: ['entrance', 'reception', 'activity_room', 'dining_room', 'other']
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    method: {
      type: String,
      enum: ['manual', 'qr_code', 'rfid', 'biometric', 'app'],
      default: 'manual'
    },
    notes: String
  },
  
  checkOut: {
    time: Date,
    location: {
      type: String,
      enum: ['entrance', 'reception', 'activity_room', 'dining_room', 'other']
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    method: {
      type: String,
      enum: ['manual', 'qr_code', 'rfid', 'biometric', 'app'],
      default: 'manual'
    },
    notes: String
  },
  
  // 請假記錄
  leaveRequest: {
    type: {
      type: String,
      enum: ['sick_leave', 'personal_leave', 'family_emergency', 'medical_appointment', 'other']
    },
    reason: String,
    startDate: Date,
    endDate: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String
  },
  
  // 接送記錄
  transportation: {
    pickup: {
      time: Date,
      driver: String,
      vehicle: String,
      notes: String
    },
    dropoff: {
      time: Date,
      driver: String,
      vehicle: String,
      notes: String
    }
  },
  
  // 活動參與
  activities: [{
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    startTime: Date,
    endTime: Date,
    participation: {
      type: String,
      enum: ['full', 'partial', 'absent'],
      default: 'full'
    },
    notes: String
  }],
  
  // 餐食記錄
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    time: Date,
    status: {
      type: String,
      enum: ['eaten', 'partial', 'refused', 'not_served'],
      default: 'eaten'
    },
    specialDiet: String,
    notes: String
  }],
  
  // 照護記錄
  careRecords: [{
    type: {
      type: String,
      enum: ['medication', 'bathroom_assistance', 'mobility_assistance', 'feeding_assistance', 'other']
    },
    time: Date,
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String,
    duration: Number, // 分鐘
    notes: String
  }],
  
  // 健康狀況
  healthStatus: {
    general: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    mood: {
      type: String,
      enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'],
      default: 'neutral'
    },
    energy: {
      type: String,
      enum: ['very_high', 'high', 'normal', 'low', 'very_low'],
      default: 'normal'
    },
    sleep: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    appetite: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  
  // 特殊事件
  incidents: [{
    type: {
      type: String,
      enum: ['fall', 'injury', 'behavioral', 'medical', 'other']
    },
    time: Date,
    description: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical']
    },
    actionTaken: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followUpRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // 家屬通知
  familyNotifications: [{
    type: {
      type: String,
      enum: ['check_in', 'check_out', 'incident', 'health_concern', 'activity_update']
    },
    sentAt: Date,
    sentTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // 備註
  notes: {
    type: String,
    maxlength: [1000, '備註不能超過1000個字元']
  },
  
  // 系統記錄
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虛擬欄位
attendanceSchema.virtual('totalHours').get(function() {
  if (!this.checkIn || !this.checkOut) return 0;
  
  const checkInTime = new Date(this.checkIn.time);
  const checkOutTime = new Date(this.checkOut.time);
  const diffMs = checkOutTime - checkInTime;
  
  return Math.round(diffMs / (1000 * 60 * 60) * 100) / 100; // 四捨五入到小數點後兩位
});

attendanceSchema.virtual('isLate').get(function() {
  if (!this.checkIn) return false;
  
  const checkInTime = new Date(this.checkIn.time);
  const expectedTime = new Date(this.date);
  expectedTime.setHours(8, 0, 0, 0); // 假設期望報到時間為早上8點
  
  return checkInTime > expectedTime;
});

attendanceSchema.virtual('isEarlyLeave').get(function() {
  if (!this.checkOut) return false;
  
  const checkOutTime = new Date(this.checkOut.time);
  const expectedTime = new Date(this.date);
  expectedTime.setHours(17, 0, 0, 0); // 假設期望離開時間為下午5點
  
  return checkOutTime < expectedTime;
});

// 索引
attendanceSchema.index({ elderly: 1, date: -1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ 'checkIn.time': 1 });
attendanceSchema.index({ 'checkOut.time': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

