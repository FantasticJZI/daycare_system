const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  // 關聯長者
  elderly: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elderly',
    required: [true, '長者ID為必填欄位']
  },
  
  // 記錄類型
  recordType: {
    type: String,
    enum: ['vital_signs', 'medication', 'symptom', 'incident', 'assessment', 'doctor_visit'],
    required: [true, '記錄類型為必填欄位']
  },
  
  // 記錄時間
  recordDate: {
    type: Date,
    required: [true, '記錄日期為必填欄位'],
    default: Date.now
  },
  
  // 記錄人員
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '記錄人員為必填欄位']
  },
  
  // 生命徵象
  vitalSigns: {
    bloodPressure: {
      systolic: {
        type: Number,
        min: [50, '收縮壓不能低於50'],
        max: [250, '收縮壓不能高於250']
      },
      diastolic: {
        type: Number,
        min: [30, '舒張壓不能低於30'],
        max: [150, '舒張壓不能高於150']
      },
      unit: {
        type: String,
        enum: ['mmHg'],
        default: 'mmHg'
      }
    },
    heartRate: {
      value: {
        type: Number,
        min: [30, '心跳不能低於30'],
        max: [200, '心跳不能高於200']
      },
      unit: {
        type: String,
        enum: ['bpm'],
        default: 'bpm'
      }
    },
    temperature: {
      value: {
        type: Number,
        min: [30, '體溫不能低於30度'],
        max: [45, '體溫不能高於45度']
      },
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    bloodSugar: {
      value: {
        type: Number,
        min: [0, '血糖不能為負數'],
        max: [1000, '血糖不能超過1000']
      },
      unit: {
        type: String,
        enum: ['mg/dL', 'mmol/L'],
        default: 'mg/dL'
      },
      type: {
        type: String,
        enum: ['fasting', 'postprandial', 'random'],
        default: 'random'
      }
    },
    oxygenSaturation: {
      value: {
        type: Number,
        min: [0, '血氧飽和度不能低於0%'],
        max: [100, '血氧飽和度不能高於100%']
      },
      unit: {
        type: String,
        enum: ['%'],
        default: '%'
      }
    },
    weight: {
      value: {
        type: Number,
        min: [0, '體重不能為負數']
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    height: {
      value: {
        type: Number,
        min: [0, '身高不能為負數']
      },
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      }
    }
  },
  
  // 用藥記錄
  medication: {
    name: String,
    dosage: String,
    frequency: String,
    route: {
      type: String,
      enum: ['oral', 'injection', 'topical', 'inhalation', 'other']
    },
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    givenAt: Date,
    notes: String
  },
  
  // 症狀記錄
  symptoms: [{
    symptom: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    duration: String,
    description: String
  }],
  
  // 事件記錄
  incident: {
    type: {
      type: String,
      enum: ['fall', 'injury', 'behavioral', 'medical_emergency', 'other']
    },
    description: String,
    location: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical']
    },
    actionTaken: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpNotes: String
  },
  
  // 評估記錄
  assessment: {
    type: {
      type: String,
      enum: ['adl', 'iadl', 'mmse', 'mood', 'pain', 'nutrition', 'other']
    },
    score: Number,
    maxScore: Number,
    notes: String,
    recommendations: String
  },
  
  // 醫師巡診
  doctorVisit: {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    diagnosis: String,
    treatment: String,
    followUpDate: Date,
    notes: String,
    prescriptions: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String
    }]
  },
  
  // 一般記錄
  notes: {
    type: String,
    maxlength: [1000, '備註不能超過1000個字元']
  },
  
  // 附件
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 狀態
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed', 'archived'],
    default: 'completed'
  },
  
  // 審核
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // 通知設定
  notifyFamily: {
    type: Boolean,
    default: false
  },
  notifyDoctor: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虛擬欄位
healthRecordSchema.virtual('isAbnormal').get(function() {
  if (!this.vitalSigns) return false;
  
  const { bloodPressure, heartRate, temperature, bloodSugar, oxygenSaturation } = this.vitalSigns;
  
  // 血壓異常
  if (bloodPressure && (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90 || 
      bloodPressure.systolic < 90 || bloodPressure.diastolic < 60)) {
    return true;
  }
  
  // 心跳異常
  if (heartRate && (heartRate.value > 100 || heartRate.value < 60)) {
    return true;
  }
  
  // 體溫異常
  if (temperature && (temperature.value > 37.5 || temperature.value < 36.0)) {
    return true;
  }
  
  // 血糖異常
  if (bloodSugar && (bloodSugar.value > 200 || bloodSugar.value < 70)) {
    return true;
  }
  
  // 血氧異常
  if (oxygenSaturation && oxygenSaturation.value < 95) {
    return true;
  }
  
  return false;
});

// 索引
healthRecordSchema.index({ elderly: 1, recordDate: -1 });
healthRecordSchema.index({ recordType: 1 });
healthRecordSchema.index({ recordedBy: 1 });
healthRecordSchema.index({ recordDate: -1 });
healthRecordSchema.index({ status: 1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);

