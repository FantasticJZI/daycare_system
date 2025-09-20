// 模擬數據 - 用於GitHub Pages演示
export const mockUsers = {
  admin: {
    _id: '1',
    name: '系統管理員',
    email: 'admin@daycare.com',
    phone: '0912345678',
    role: 'admin' as const,
    isActive: true,
    notificationSettings: {
      email: true,
      sms: true,
      push: true,
      line: true
    }
  }
};

export const mockElderly = [
  {
    _id: '1',
    name: '張三',
    idNumber: 'A123456789',
    birthDate: '1950-01-01',
    gender: 'male' as const,
    phone: '0912345678',
    address: '台北市信義區信義路五段7號',
    serviceStatus: 'active' as const,
    emergencyContacts: [
      {
        name: '張小明',
        phone: '0912345679',
        relationship: '兒子',
        isPrimary: true
      }
    ],
    medicalInfo: {
      bloodType: 'A',
      allergies: [],
      chronicDiseases: [
        {
          disease: '高血壓',
          diagnosisDate: '2020-01-01',
          severity: '輕度',
          notes: '定期服藥控制'
        }
      ]
    },
    careAssessment: {
      level: 2,
      assessmentDate: '2024-01-01',
      nextAssessmentDate: '2024-07-01',
      notes: '生活自理能力良好'
    }
  },
  {
    _id: '2',
    name: '李四',
    idNumber: 'B123456789',
    birthDate: '1945-03-15',
    gender: 'female' as const,
    phone: '0912345680',
    address: '台北市大安區仁愛路四段300號',
    serviceStatus: 'waiting' as const,
    emergencyContacts: [
      {
        name: '李小華',
        phone: '0912345681',
        relationship: '女兒',
        isPrimary: true
      }
    ],
    medicalInfo: {
      bloodType: 'O',
      allergies: [
        {
          allergen: '花生',
          severity: '嚴重',
          notes: '會導致呼吸困難'
        }
      ],
      chronicDiseases: []
    },
    careAssessment: {
      level: 3,
      assessmentDate: '2024-01-01',
      nextAssessmentDate: '2024-07-01',
      notes: '需要協助日常活動'
    }
  },
  {
    _id: '3',
    name: '王五',
    idNumber: 'C123456789',
    birthDate: '1940-06-20',
    gender: 'male' as const,
    phone: '0912345682',
    address: '台北市中山區南京東路二段100號',
    serviceStatus: 'suspended' as const,
    emergencyContacts: [
      {
        name: '王小美',
        phone: '0912345683',
        relationship: '女兒',
        isPrimary: true
      }
    ],
    medicalInfo: {
      bloodType: 'B',
      allergies: [],
      chronicDiseases: [
        {
          disease: '糖尿病',
          diagnosisDate: '2019-01-01',
          severity: '中度',
          notes: '需要定期監測血糖'
        }
      ]
    },
    careAssessment: {
      level: 4,
      assessmentDate: '2024-01-01',
      nextAssessmentDate: '2024-07-01',
      notes: '需要較多照護協助'
    }
  }
];

export const mockHealthRecords = [
  {
    _id: '1',
    elderly: '1',
    recordType: 'vital_signs',
    vitalSigns: {
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: { value: 72 },
      temperature: { value: 36.5 }
    },
    recordedBy: '1',
    recordedAt: new Date().toISOString(),
    notes: '血壓正常，身體狀況良好'
  }
];

export const mockActivities = [
  {
    _id: '1',
    name: '晨間運動',
    description: '輕度伸展運動和散步',
    type: 'physical',
    startTime: '09:00',
    endTime: '10:00',
    location: '活動室',
    maxParticipants: 20,
    currentParticipants: 15,
    status: 'active',
    createdBy: '1',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: '手工藝製作',
    description: '製作紙花和編織',
    type: 'creative',
    startTime: '14:00',
    endTime: '15:30',
    location: '手工藝教室',
    maxParticipants: 12,
    currentParticipants: 8,
    status: 'active',
    createdBy: '1',
    createdAt: new Date().toISOString()
  }
];

export const mockAttendance = [
  {
    _id: '1',
    elderly: '1',
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    status: 'present',
    notes: '正常出勤'
  }
];

// 檢查是否為演示模式
export const isDemoMode = () => {
  return window.location.hostname === 'fantasticjzi.github.io';
};
