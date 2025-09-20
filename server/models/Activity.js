const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // 活動基本資料
  name: {
    type: String,
    required: [true, '活動名稱為必填欄位'],
    trim: true,
    maxlength: [100, '活動名稱不能超過100個字元']
  },
  description: {
    type: String,
    maxlength: [500, '活動描述不能超過500個字元']
  },
  
  // 活動類型
  type: {
    type: String,
    enum: ['physical', 'cognitive', 'social', 'creative', 'recreational', 'educational', 'therapeutic'],
    required: [true, '活動類型為必填欄位']
  },
  
  // 活動分類
  category: {
    type: String,
    enum: ['exercise', 'games', 'arts_crafts', 'music', 'cooking', 'gardening', 'reading', 'discussion', 'outdoor', 'other'],
    required: [true, '活動分類為必填欄位']
  },
  
  // 時間安排
  schedule: {
    date: {
      type: Date,
      required: [true, '活動日期為必填欄位']
    },
    startTime: {
      type: String,
      required: [true, '開始時間為必填欄位'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效的時間格式 (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, '結束時間為必填欄位'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效的時間格式 (HH:MM)']
    },
    duration: {
      type: Number, // 分鐘
      required: [true, '活動時長為必填欄位']
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: null
    },
    recurringDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  
  // 地點
  location: {
    name: {
      type: String,
      required: [true, '活動地點為必填欄位']
    },
    room: String,
    capacity: {
      type: Number,
      min: [1, '容納人數至少為1人']
    }
  },
  
  // 負責人員
  staff: {
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '活動負責人為必填欄位']
    },
    assistants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    volunteers: [{
      name: String,
      phone: String,
      email: String
    }]
  },
  
  // 參與者
  participants: [{
    elderly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Elderly',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'absent', 'cancelled'],
      default: 'registered'
    },
    notes: String
  }],
  
  // 活動內容
  content: {
    objectives: [String], // 活動目標
    materials: [String], // 所需材料
    instructions: String, // 活動說明
    safetyNotes: String, // 安全注意事項
    adaptations: String // 特殊需求調整
  },
  
  // 健康考量
  healthConsiderations: {
    physicalRequirements: [String], // 體能需求
    cognitiveRequirements: [String], // 認知需求
    mobilityRequirements: [String], // 行動需求
    medicalRestrictions: [String], // 醫療限制
    specialNeeds: [String] // 特殊需求
  },
  
  // 活動狀態
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'planned'
  },
  
  // 實際執行記錄
  execution: {
    actualStartTime: Date,
    actualEndTime: Date,
    actualDuration: Number, // 實際執行時間（分鐘）
    attendanceCount: {
      type: Number,
      default: 0
    },
    notes: String,
    issues: [String], // 執行過程中的問題
    improvements: [String] // 改進建議
  },
  
  // 評估結果
  evaluation: {
    participantFeedback: [{
      elderly: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Elderly'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }],
    staffFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submittedAt: {
        type: Date,
        default: Date.now
      }
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    effectiveness: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    recommendations: String
  },
  
  // 照片和文件
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // 成本記錄
  cost: {
    materials: {
      type: Number,
      default: 0
    },
    equipment: {
      type: Number,
      default: 0
    },
    transportation: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  
  // 系統設定
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 備註
  notes: {
    type: String,
    maxlength: [1000, '備註不能超過1000個字元']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虛擬欄位
activitySchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const activityDate = new Date(this.schedule.date);
  activityDate.setHours(parseInt(this.schedule.startTime.split(':')[0]), parseInt(this.schedule.startTime.split(':')[1]));
  
  return activityDate > now && this.status === 'planned';
});

activitySchema.virtual('isOngoing').get(function() {
  const now = new Date();
  const activityDate = new Date(this.schedule.date);
  const startTime = new Date(activityDate);
  startTime.setHours(parseInt(this.schedule.startTime.split(':')[0]), parseInt(this.schedule.startTime.split(':')[1]));
  
  const endTime = new Date(activityDate);
  endTime.setHours(parseInt(this.schedule.endTime.split(':')[0]), parseInt(this.schedule.endTime.split(':')[1]));
  
  return now >= startTime && now <= endTime && this.status === 'ongoing';
});

activitySchema.virtual('isPast').get(function() {
  const now = new Date();
  const activityDate = new Date(this.schedule.date);
  const endTime = new Date(activityDate);
  endTime.setHours(parseInt(this.schedule.endTime.split(':')[0]), parseInt(this.schedule.endTime.split(':')[1]));
  
  return endTime < now;
});

// 索引
activitySchema.index({ 'schedule.date': -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ 'staff.leader': 1 });
activitySchema.index({ isActive: 1 });

module.exports = mongoose.model('Activity', activitySchema);

