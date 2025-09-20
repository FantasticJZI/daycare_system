const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, requireFamilyAccess } = require('../middleware/auth');
const { validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取照護記錄列表
router.get('/records', 
  validatePagination,
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        elderlyId = '', 
        type = '',
        startDate = '',
        endDate = ''
      } = req.query;

      // 這裡可以建立一個專門的照護記錄模型
      // 目前使用出勤記錄中的照護記錄部分
      const Attendance = require('../models/Attendance');
      
      const query = {};
      
      if (elderlyId) {
        query.elderly = elderlyId;
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const attendance = await Attendance.find(query)
        .populate('elderly', 'name idNumber photo')
        .populate('createdBy', 'name role')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // 提取照護記錄
      const careRecords = [];
      attendance.forEach(att => {
        if (att.careRecords && att.careRecords.length > 0) {
          att.careRecords.forEach(care => {
            careRecords.push({
              ...care.toObject(),
              elderly: att.elderly,
              date: att.date,
              attendanceId: att._id
            });
          });
        }
      });

      // 如果指定了類型，進行過濾
      const filteredRecords = type ? 
        careRecords.filter(record => record.type === type) : 
        careRecords;

      res.json({
        success: true,
        data: {
          careRecords: filteredRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredRecords.length / parseInt(limit)),
            totalItems: filteredRecords.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取照護記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取照護記錄時發生錯誤'
      });
    }
  }
);

// 建立照護記錄
router.post('/records', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { elderlyId, careRecord } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 查找今日的出勤記錄
      let attendance = await Attendance.findOne({
        elderly: elderlyId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!attendance) {
        // 建立新的出勤記錄
        attendance = new Attendance({
          elderly: elderlyId,
          date: today,
          status: 'present',
          careRecords: [{
            ...careRecord,
            caregiver: req.user._id,
            time: new Date()
          }],
          createdBy: req.user._id
        });
      } else {
        // 新增照護記錄到現有的出勤記錄
        attendance.careRecords.push({
          ...careRecord,
          caregiver: req.user._id,
          time: new Date()
        });
        attendance.lastModifiedBy = req.user._id;
      }

      await attendance.save();

      res.status(201).json({
        success: true,
        message: '照護記錄建立成功',
        data: { attendance }
      });
    } catch (error) {
      console.error('建立照護記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '建立照護記錄時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 獲取用藥記錄
router.get('/medications', 
  validatePagination,
  async (req, res) => {
    try {
      const HealthRecord = require('../models/HealthRecord');
      const { 
        page = 1, 
        limit = 10, 
        elderlyId = '',
        startDate = '',
        endDate = ''
      } = req.query;

      const query = { recordType: 'medication' };
      
      if (elderlyId) {
        query.elderly = elderlyId;
      }

      if (startDate || endDate) {
        query.recordDate = {};
        if (startDate) query.recordDate.$gte = new Date(startDate);
        if (endDate) query.recordDate.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const healthRecords = await HealthRecord.find(query)
        .populate('elderly', 'name idNumber photo')
        .populate('recordedBy', 'name role')
        .populate('medication.givenBy', 'name role')
        .sort({ recordDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await HealthRecord.countDocuments(query);

      res.json({
        success: true,
        data: {
          medications: healthRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取用藥記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取用藥記錄時發生錯誤'
      });
    }
  }
);

// 記錄用藥
router.post('/medications', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const HealthRecord = require('../models/HealthRecord');
      const { elderlyId, medication } = req.body;

      const healthRecord = new HealthRecord({
        elderly: elderlyId,
        recordType: 'medication',
        medication: {
          ...medication,
          givenBy: req.user._id,
          givenAt: new Date()
        },
        recordedBy: req.user._id
      });

      await healthRecord.save();

      res.status(201).json({
        success: true,
        message: '用藥記錄建立成功',
        data: { healthRecord }
      });
    } catch (error) {
      console.error('記錄用藥錯誤:', error);
      res.status(500).json({
        success: false,
        message: '記錄用藥時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 獲取事件記錄
router.get('/incidents', 
  validatePagination,
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { 
        page = 1, 
        limit = 10, 
        elderlyId = '',
        type = '',
        severity = '',
        startDate = '',
        endDate = ''
      } = req.query;

      const query = {};
      
      if (elderlyId) {
        query.elderly = elderlyId;
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const attendance = await Attendance.find(query)
        .populate('elderly', 'name idNumber photo')
        .populate('createdBy', 'name role')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // 提取事件記錄
      const incidents = [];
      attendance.forEach(att => {
        if (att.incidents && att.incidents.length > 0) {
          att.incidents.forEach(incident => {
            if ((!type || incident.type === type) && 
                (!severity || incident.severity === severity)) {
              incidents.push({
                ...incident.toObject(),
                elderly: att.elderly,
                date: att.date,
                attendanceId: att._id
              });
            }
          });
        }
      });

      res.json({
        success: true,
        data: {
          incidents,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(incidents.length / parseInt(limit)),
            totalItems: incidents.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取事件記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取事件記錄時發生錯誤'
      });
    }
  }
);

// 記錄事件
router.post('/incidents', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { sendEmergencyNotification } = require('../utils/notification');
      const Elderly = require('../models/Elderly');
      const { elderlyId, incident } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 查找今日的出勤記錄
      let attendance = await Attendance.findOne({
        elderly: elderlyId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!attendance) {
        // 建立新的出勤記錄
        attendance = new Attendance({
          elderly: elderlyId,
          date: today,
          status: 'present',
          incidents: [{
            ...incident,
            reportedBy: req.user._id,
            time: new Date()
          }],
          createdBy: req.user._id
        });
      } else {
        // 新增事件記錄到現有的出勤記錄
        attendance.incidents.push({
          ...incident,
          reportedBy: req.user._id,
          time: new Date()
        });
        attendance.lastModifiedBy = req.user._id;
      }

      await attendance.save();

      // 如果是緊急事件，發送通知
      if (incident.severity === 'critical' || incident.severity === 'major') {
        const elderly = await Elderly.findById(elderlyId)
          .populate('familyMembers.user');
        
        const familyMembers = elderly.familyMembers.filter(member => 
          member.canReceiveNotifications
        );
        
        if (familyMembers.length > 0) {
          await sendEmergencyNotification(elderly, incident, familyMembers);
        }
      }

      res.status(201).json({
        success: true,
        message: '事件記錄建立成功',
        data: { attendance }
      });
    } catch (error) {
      console.error('記錄事件錯誤:', error);
      res.status(500).json({
        success: false,
        message: '記錄事件時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 獲取照護統計
router.get('/stats/overview', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);

      const query = {};
      if (Object.keys(dateQuery).length > 0) {
        query.date = dateQuery;
      }

      const Attendance = require('../models/Attendance');
      const HealthRecord = require('../models/HealthRecord');

      // 照護記錄統計
      const careStats = await Attendance.aggregate([
        { $match: query },
        {
          $project: {
            careRecordCount: { $size: { $ifNull: ['$careRecords', []] } },
            incidentCount: { $size: { $ifNull: ['$incidents', []] } }
          }
        },
        {
          $group: {
            _id: null,
            totalCareRecords: { $sum: '$careRecordCount' },
            totalIncidents: { $sum: '$incidentCount' }
          }
        }
      ]);

      // 用藥記錄統計
      const medicationStats = await HealthRecord.aggregate([
        { 
          $match: { 
            ...query, 
            recordType: 'medication' 
          } 
        },
        {
          $group: {
            _id: null,
            totalMedications: { $sum: 1 },
            uniqueElderly: { $addToSet: '$elderly' }
          }
        },
        {
          $project: {
            totalMedications: 1,
            uniqueElderlyCount: { $size: '$uniqueElderly' }
          }
        }
      ]);

      // 事件嚴重程度統計
      const incidentSeverityStats = await Attendance.aggregate([
        { $match: query },
        { $unwind: { path: '$incidents', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$incidents.severity',
            count: { $sum: 1 }
          }
        },
        { $match: { _id: { $ne: null } } }
      ]);

      res.json({
        success: true,
        data: {
          careStats: careStats[0] || {},
          medicationStats: medicationStats[0] || {},
          incidentSeverityStats
        }
      });
    } catch (error) {
      console.error('獲取照護統計錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取照護統計時發生錯誤'
      });
    }
  }
);

module.exports = router;

