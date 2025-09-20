const mongoose = require('mongoose');

const elderlySchema = new mongoose.Schema({
  // 基本資料
  name: {
    type: String,
    required: [true, '姓名為必填欄位'],
    trim: true,
    maxlength: [50, '姓名不能超過50個字元']
  },
  idNumber: {
    type: String,
    required: [true, '身分證字號為必填欄位'],
    unique: true,
    match: [/^[A-Z][12]\d{8}$/, '請輸入有效的身分證字號格式']
  },
  birthDate: {
    type: Date,
    required: [true, '出生日期為必填欄位']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, '性別為必填欄位']
  },
  phone: {
    type: String,
    required: [true, '電話號碼為必填欄位'],
    match: [/^09\d{8}$/, '請輸入有效的手機號碼格式']
  },
  address: {
    type: String,
    required: [true, '地址為必填欄位']
  },
  photo: {
    type: String,
    default: null
  },
  
  // 緊急聯絡人
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^09\d{8}$/, '請輸入有效的手機號碼格式']
    },
    relationship: {
      type: String,
      required: true,
      enum: ['spouse', 'child', 'parent', 'sibling', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // 醫療資訊
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A', 'B', 'AB', 'O', 'unknown'],
      default: 'unknown'
    },
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      notes: String
    }],
    chronicDiseases: [{
      disease: String,
      diagnosisDate: Date,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      notes: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      notes: String
    }],
    doctor: {
      name: String,
      hospital: String,
      phone: String,
      specialty: String
    }
  },
  
  // 照護需求
  careNeeds: {
    mobility: {
      type: String,
      enum: ['independent', 'assistance_needed', 'wheelchair_bound', 'bedridden'],
      default: 'independent'
    },
    cognitive: {
      type: String,
      enum: ['normal', 'mild_impairment', 'moderate_impairment', 'severe_impairment'],
      default: 'normal'
    },
    dailyActivities: {
      bathing: {
        type: String,
        enum: ['independent', 'supervision', 'assistance', 'total_care'],
        default: 'independent'
      },
      dressing: {
        type: String,
        enum: ['independent', 'supervision', 'assistance', 'total_care'],
        default: 'independent'
      },
      eating: {
        type: String,
        enum: ['independent', 'supervision', 'assistance', 'total_care'],
        default: 'independent'
      },
      toileting: {
        type: String,
        enum: ['independent', 'supervision', 'assistance', 'total_care'],
        default: 'independent'
      }
    },
    specialNeeds: [String],
    dietaryRestrictions: [String],
    mobilityAids: [String]
  },
  
  // 長照評估
  longTermCareAssessment: {
    assessmentDate: Date,
    assessor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adlScore: Number, // 日常生活活動能力分數
    iadlScore: Number, // 工具性日常生活活動能力分數
    mmseScore: Number, // 簡易智能測驗分數
    careLevel: {
      type: String,
      enum: ['level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8'],
      default: 'level1'
    },
    carePlan: String,
    reviewDate: Date
  },
  
  // 家屬資訊
  familyMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    relationship: {
      type: String,
      required: true,
      enum: ['spouse', 'child', 'parent', 'sibling', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    canViewHealthData: {
      type: Boolean,
      default: true
    },
    canReceiveNotifications: {
      type: Boolean,
      default: true
    }
  }],
  
  // 服務狀態
  serviceStatus: {
    type: String,
    enum: ['active', 'suspended', 'terminated', 'waiting'],
    default: 'waiting'
  },
  serviceStartDate: {
    type: Date,
    default: null
  },
  serviceEndDate: {
    type: Date,
    default: null
  },
  
  // 費用設定
  fees: {
    monthlyFee: {
      type: Number,
      default: 0
    },
    mealFee: {
      type: Number,
      default: 0
    },
    transportFee: {
      type: Number,
      default: 0
    },
    otherFees: [{
      name: String,
      amount: Number,
      frequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly', 'one_time']
      }
    }]
  },
  
  // 系統設定
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虛擬欄位
elderlySchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// 索引
elderlySchema.index({ idNumber: 1 });
elderlySchema.index({ name: 1 });
elderlySchema.index({ serviceStatus: 1 });
elderlySchema.index({ isActive: 1 });
elderlySchema.index({ 'familyMembers.user': 1 });

module.exports = mongoose.model('Elderly', elderlySchema);

