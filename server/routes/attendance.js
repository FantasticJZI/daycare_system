const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, requireFamilyAccess } = require('../middleware/auth');
const { validateAttendance, validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取出勤記錄列表
router.get('/', 
  validatePagination,
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { 
        page = 1, 
        limit = 10, 
        elderlyId = '', 
        date = '', 
        status = '',
        startDate = '',
        endDate = ''
      } = req.query;

      const query = {};
      
      if (elderlyId) {
        query.elderly = elderlyId;
      }

      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = {
          $gte: targetDate,
          $lt: nextDay
        };
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (status) {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const attendance = await Attendance.find(query)
        .populate('elderly', 'name idNumber photo')
        .populate('createdBy', 'name role')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Attendance.countDocuments(query);

      res.json({
        success: true,
        data: {
          attendance,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取出勤記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取出勤記錄時發生錯誤'
      });
    }
  }
);

// 獲取單一出勤記錄
router.get('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const attendance = await Attendance.findById(req.params.id)
        .populate('elderly', 'name idNumber photo')
        .populate('createdBy', 'name role')
        .populate('lastModifiedBy', 'name role');

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的出勤記錄'
        });
      }

      res.json({
        success: true,
        data: { attendance }
      });
    } catch (error) {
      console.error('獲取出勤記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取出勤記錄時發生錯誤'
      });
    }
  }
);

// 建立出勤記錄
router.post('/', 
  requireRole('admin', 'nurse', 'caregiver'),
  validateAttendance,
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { sendAttendanceNotification } = require('../utils/notification');
      const Elderly = require('../models/Elderly');
      
      const attendanceData = req.body;
      attendanceData.createdBy = req.user._id;

      const attendance = new Attendance(attendanceData);
      await attendance.save();

      // 獲取長者資料並通知家屬
      const elderly = await Elderly.findById(attendance.elderly)
        .populate('familyMembers.user');

      if (elderly && elderly.familyMembers.length > 0) {
        const familyMembers = elderly.familyMembers.filter(member => 
          member.canReceiveNotifications
        );
        
        if (familyMembers.length > 0) {
          await sendAttendanceNotification(elderly, attendance, familyMembers);
        }
      }

      res.status(201).json({
        success: true,
        message: '出勤記錄建立成功',
        data: { attendance }
      });
    } catch (error) {
      console.error('建立出勤記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '建立出勤記錄時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 更新出勤記錄
router.put('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const updateData = req.body;
      updateData.lastModifiedBy = req.user._id;

      const attendance = await Attendance.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的出勤記錄'
        });
      }

      res.json({
        success: true,
        message: '出勤記錄更新成功',
        data: { attendance }
      });
    } catch (error) {
      console.error('更新出勤記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新出勤記錄時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 刪除出勤記錄（管理員、護理師）
router.delete('/:id', 
  requireRole('admin', 'nurse'),
  validateMongoId('id'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const attendance = await Attendance.findByIdAndDelete(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的出勤記錄'
        });
      }

      res.json({
        success: true,
        message: '出勤記錄刪除成功'
      });
    } catch (error) {
      console.error('刪除出勤記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '刪除出勤記錄時發生錯誤'
      });
    }
  }
);

// 打卡功能
router.post('/check-in', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { elderlyId, location = 'entrance', method = 'manual', notes = '' } = req.body;

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
          checkIn: {
            time: new Date(),
            location,
            recordedBy: req.user._id,
            method,
            notes
          },
          createdBy: req.user._id
        });
      } else {
        // 更新現有的出勤記錄
        attendance.checkIn = {
          time: new Date(),
          location,
          recordedBy: req.user._id,
          method,
          notes
        };
        attendance.status = 'present';
        attendance.lastModifiedBy = req.user._id;
      }

      await attendance.save();

      res.json({
        success: true,
        message: '打卡成功',
        data: { attendance }
      });
    } catch (error) {
      console.error('打卡錯誤:', error);
      res.status(500).json({
        success: false,
        message: '打卡時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 簽退功能
router.post('/check-out', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { elderlyId, location = 'entrance', method = 'manual', notes = '' } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 查找今日的出勤記錄
      const attendance = await Attendance.findOne({
        elderly: elderlyId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: '找不到今日的出勤記錄，請先打卡'
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          success: false,
          message: '今日已簽退'
        });
      }

      // 更新簽退資訊
      attendance.checkOut = {
        time: new Date(),
        location,
        recordedBy: req.user._id,
        method,
        notes
      };
      attendance.lastModifiedBy = req.user._id;

      await attendance.save();

      res.json({
        success: true,
        message: '簽退成功',
        data: { attendance }
      });
    } catch (error) {
      console.error('簽退錯誤:', error);
      res.status(500).json({
        success: false,
        message: '簽退時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 獲取出勤統計
router.get('/stats/overview', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const Attendance = require('../models/Attendance');
      const { startDate, endDate } = req.query;

      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);

      const query = {};
      if (Object.keys(dateQuery).length > 0) {
        query.date = dateQuery;
      }

      // 出勤狀態統計
      const statusStats = await Attendance.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // 每日出勤趨勢
      const dailyTrends = await Attendance.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$date'
              }
            },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          statusStats,
          dailyTrends
        }
      });
    } catch (error) {
      console.error('獲取出勤統計錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取出勤統計時發生錯誤'
      });
    }
  }
);

module.exports = router;

