const { body, param, query, validationResult } = require('express-validator');

// 驗證結果處理中間件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '輸入資料驗證失敗',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// 使用者驗證規則
const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('姓名為必填欄位')
    .isLength({ max: 50 })
    .withMessage('姓名不能超過50個字元'),
  
  body('email')
    .isEmail()
    .withMessage('請輸入有效的電子郵件格式')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密碼至少需要6個字元')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密碼必須包含至少一個大寫字母、一個小寫字母和一個數字'),
  
  body('phone')
    .matches(/^09\d{8}$/)
    .withMessage('請輸入有效的手機號碼格式'),
  
  body('role')
    .isIn(['admin', 'nurse', 'caregiver', 'family', 'doctor'])
    .withMessage('無效的角色類型'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('無效的性別類型'),
  
  handleValidationErrors
];

// 長者驗證規則
const validateElderly = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('姓名為必填欄位')
    .isLength({ max: 50 })
    .withMessage('姓名不能超過50個字元'),
  
  body('idNumber')
    .matches(/^[A-Z][12]\d{8}$/)
    .withMessage('請輸入有效的身分證字號格式'),
  
  body('birthDate')
    .isISO8601()
    .withMessage('請輸入有效的出生日期格式')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 65) {
        throw new Error('長者年齡必須滿65歲');
      }
      
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('無效的性別類型'),
  
  body('phone')
    .matches(/^09\d{8}$/)
    .withMessage('請輸入有效的手機號碼格式'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('地址為必填欄位'),
  
  body('emergencyContacts')
    .isArray({ min: 1 })
    .withMessage('至少需要一個緊急聯絡人'),
  
  body('emergencyContacts.*.name')
    .trim()
    .notEmpty()
    .withMessage('緊急聯絡人姓名為必填欄位'),
  
  body('emergencyContacts.*.phone')
    .matches(/^09\d{8}$/)
    .withMessage('緊急聯絡人電話格式無效'),
  
  body('emergencyContacts.*.relationship')
    .isIn(['spouse', 'child', 'parent', 'sibling', 'other'])
    .withMessage('無效的關係類型'),
  
  handleValidationErrors
];

// 健康記錄驗證規則
const validateHealthRecord = [
  body('elderly')
    .isMongoId()
    .withMessage('無效的長者ID'),
  
  body('recordType')
    .isIn(['vital_signs', 'medication', 'symptom', 'incident', 'assessment', 'doctor_visit'])
    .withMessage('無效的記錄類型'),
  
  body('recordDate')
    .optional()
    .isISO8601()
    .withMessage('請輸入有效的記錄日期格式'),
  
  body('vitalSigns.bloodPressure.systolic')
    .optional()
    .isInt({ min: 50, max: 250 })
    .withMessage('收縮壓必須在50-250之間'),
  
  body('vitalSigns.bloodPressure.diastolic')
    .optional()
    .isInt({ min: 30, max: 150 })
    .withMessage('舒張壓必須在30-150之間'),
  
  body('vitalSigns.heartRate.value')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('心跳必須在30-200之間'),
  
  body('vitalSigns.temperature.value')
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage('體溫必須在30-45度之間'),
  
  body('vitalSigns.bloodSugar.value')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('血糖必須在0-1000之間'),
  
  body('vitalSigns.oxygenSaturation.value')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('血氧飽和度必須在0-100%之間'),
  
  handleValidationErrors
];

// 出勤記錄驗證規則
const validateAttendance = [
  body('elderly')
    .isMongoId()
    .withMessage('無效的長者ID'),
  
  body('date')
    .isISO8601()
    .withMessage('請輸入有效的日期格式'),
  
  body('status')
    .isIn(['present', 'absent', 'late', 'early_leave', 'sick_leave', 'personal_leave'])
    .withMessage('無效的出勤狀態'),
  
  body('checkIn.time')
    .optional()
    .isISO8601()
    .withMessage('請輸入有效的打卡時間格式'),
  
  body('checkOut.time')
    .optional()
    .isISO8601()
    .withMessage('請輸入有效的離開時間格式'),
  
  handleValidationErrors
];

// 活動驗證規則
const validateActivity = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('活動名稱為必填欄位')
    .isLength({ max: 100 })
    .withMessage('活動名稱不能超過100個字元'),
  
  body('type')
    .isIn(['physical', 'cognitive', 'social', 'creative', 'recreational', 'educational', 'therapeutic'])
    .withMessage('無效的活動類型'),
  
  body('category')
    .isIn(['exercise', 'games', 'arts_crafts', 'music', 'cooking', 'gardening', 'reading', 'discussion', 'outdoor', 'other'])
    .withMessage('無效的活動分類'),
  
  body('schedule.date')
    .isISO8601()
    .withMessage('請輸入有效的活動日期格式'),
  
  body('schedule.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('請輸入有效的開始時間格式 (HH:MM)'),
  
  body('schedule.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('請輸入有效的結束時間格式 (HH:MM)'),
  
  body('schedule.duration')
    .isInt({ min: 1 })
    .withMessage('活動時長必須大於0分鐘'),
  
  body('location.name')
    .trim()
    .notEmpty()
    .withMessage('活動地點為必填欄位'),
  
  body('location.capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('容納人數必須大於0'),
  
  body('staff.leader')
    .isMongoId()
    .withMessage('無效的活動負責人ID'),
  
  handleValidationErrors
];

// 登入驗證規則
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('請輸入有效的電子郵件格式')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('密碼為必填欄位'),
  
  handleValidationErrors
];

// 密碼重設驗證規則
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('請輸入有效的電子郵件格式')
    .normalizeEmail(),
  
  handleValidationErrors
];

// 密碼更新驗證規則
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('目前密碼為必填欄位'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密碼至少需要6個字元')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('新密碼必須包含至少一個大寫字母、一個小寫字母和一個數字'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('確認密碼與新密碼不相符');
      }
      return true;
    }),
  
  handleValidationErrors
];

// MongoDB ID 驗證
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`無效的${paramName}格式`),
  
  handleValidationErrors
];

// 分頁查詢驗證
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('頁碼必須是大於0的整數'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁筆數必須在1-100之間'),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('排序方式必須是asc或desc'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateElderly,
  validateHealthRecord,
  validateAttendance,
  validateActivity,
  validateLogin,
  validatePasswordReset,
  validatePasswordUpdate,
  validateMongoId,
  validatePagination
};

