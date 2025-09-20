const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // 基本資料
  name: {
    type: String,
    required: [true, '姓名為必填欄位'],
    trim: true,
    maxlength: [50, '姓名不能超過50個字元']
  },
  email: {
    type: String,
    required: [true, '電子郵件為必填欄位'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請輸入有效的電子郵件格式']
  },
  password: {
    type: String,
    required: [true, '密碼為必填欄位'],
    minlength: [6, '密碼至少需要6個字元'],
    select: false // 預設查詢時不返回密碼
  },
  phone: {
    type: String,
    required: [true, '電話號碼為必填欄位'],
    match: [/^09\d{8}$/, '請輸入有效的手機號碼格式']
  },
  
  // 角色和權限
  role: {
    type: String,
    enum: ['admin', 'nurse', 'caregiver', 'family', 'doctor'],
    required: [true, '角色為必填欄位']
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'manage_users', 'manage_elderly', 'view_reports']
  }],
  
  // 個人資料
  avatar: {
    type: String,
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },
  address: {
    type: String,
    default: null
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // 工作相關（照護人員）
  employeeId: {
    type: String,
    unique: true,
    sparse: true // 允許 null 值但保持唯一性
  },
  department: {
    type: String,
    default: null
  },
  position: {
    type: String,
    default: null
  },
  hireDate: {
    type: Date,
    default: null
  },
  workSchedule: {
    type: String,
    enum: ['full-time', 'part-time', 'shift'],
    default: null
  },
  
  // 家屬相關
  relatedElderly: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elderly',
    relationship: {
      type: String,
      enum: ['spouse', 'child', 'parent', 'sibling', 'other']
    }
  }],
  
  // 系統設定
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  
  // 通知設定
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    line: {
      type: Boolean,
      default: false
    }
  },
  
  // 推播 Token
  pushTokens: [{
    token: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虛擬欄位
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// 密碼加密中間件
userSchema.pre('save', async function(next) {
  // 只有當密碼被修改時才加密
  if (!this.isModified('password')) return next();
  
  try {
    // 加密密碼
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密碼比較方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 增加登入嘗試次數
userSchema.methods.incLoginAttempts = function() {
  // 如果已經鎖定且鎖定時間未過期，則不增加嘗試次數
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // 如果達到最大嘗試次數且尚未鎖定，則鎖定帳戶
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 鎖定2小時
  }
  
  return this.updateOne(updates);
};

// 重置登入嘗試次數
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ employeeId: 1 });

module.exports = mongoose.model('User', userSchema);

