const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取家屬的長者列表
router.get('/elderly', 
  async (req, res) => {
    try {
      const User = require('../models/User');
      const Elderly = require('../models/Elderly');

      const user = await User.findById(req.user._id)
        .populate('relatedElderly.elderly');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到用戶資料'
        });
      }

      const elderlyList = user.relatedElderly.map(relation => ({
        ...relation.elderly.toObject(),
        relationship: relation.relationship
      }));

      res.json({
        success: true,
        data: { elderly: elderlyList }
      });
    } catch (error) {
      console.error('獲取家屬長者列表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取長者列表時發生錯誤'
      });
    }
  }
);

// 獲取長者的詳細資料
router.get('/elderly/:elderlyId', 
  validateMongoId('elderlyId'),
  async (req, res) => {
    try {
      const Elderly = require('../models/Elderly');
      const { elderlyId } = req.params;

      const elderly = await Elderly.findById(elderlyId)
        .populate('familyMembers.user', 'name email phone avatar');

      if (!elderly) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的長者'
        });
      }

      // 檢查是否為家屬
      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user._id.toString() === req.user._id.toString()
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權查看此長者的資料'
        });
      }

      res.json({
        success: true,
        data: { elderly }
      });
    } catch (error) {
      console.error('獲取長者詳細資料錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取長者詳細資料時發生錯誤'
      });
    }
  }
);

// 獲取長者的健康記錄
router.get('/elderly/:elderlyId/health', 
  validateMongoId('elderlyId'),
  validatePagination,
  async (req, res) => {
    try {
      const Elderly = require('../models/Elderly');
      const HealthRecord = require('../models/HealthRecord');
      const { elderlyId } = req.params;
      const { page = 1, limit = 10, recordType = '' } = req.query;

      // 檢查是否為家屬
      const elderly = await Elderly.findById(elderlyId);
      if (!elderly) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的長者'
        });
      }

      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user.toString() === req.user._id.toString() && 
        member.canViewHealthData
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權查看此長者的健康資料'
        });
      }

      const query = { elderly: elderlyId };
      if (recordType) query.recordType = recordType;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const healthRecords = await HealthRecord.find(query)
        .populate('recordedBy', 'name role')
        .sort({ recordDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await HealthRecord.countDocuments(query);

      res.json({
        success: true,
        data: {
          healthRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取健康記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取健康記錄時發生錯誤'
      });
    }
  }
);

// 獲取長者的出勤記錄
router.get('/elderly/:elderlyId/attendance', 
  validateMongoId('elderlyId'),
  validatePagination,
  async (req, res) => {
    try {
      const Elderly = require('../models/Elderly');
      const Attendance = require('../models/Attendance');
      const { elderlyId } = req.params;
      const { page = 1, limit = 10, startDate = '', endDate = '' } = req.query;

      // 檢查是否為家屬
      const elderly = await Elderly.findById(elderlyId);
      if (!elderly) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的長者'
        });
      }

      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user.toString() === req.user._id.toString()
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權查看此長者的出勤資料'
        });
      }

      const query = { elderly: elderlyId };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const attendance = await Attendance.find(query)
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

// 獲取長者的活動參與記錄
router.get('/elderly/:elderlyId/activities', 
  validateMongoId('elderlyId'),
  validatePagination,
  async (req, res) => {
    try {
      const Elderly = require('../models/Elderly');
      const Activity = require('../models/Activity');
      const { elderlyId } = req.params;
      const { page = 1, limit = 10, status = '' } = req.query;

      // 檢查是否為家屬
      const elderly = await Elderly.findById(elderlyId);
      if (!elderly) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的長者'
        });
      }

      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user.toString() === req.user._id.toString()
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權查看此長者的活動資料'
        });
      }

      const query = {
        'participants.elderly': elderlyId,
        isActive: true
      };

      if (status) {
        query['participants.status'] = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const activities = await Activity.find(query)
        .populate('staff.leader', 'name role')
        .populate('participants.elderly', 'name idNumber photo')
        .sort({ 'schedule.date': -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Activity.countDocuments(query);

      res.json({
        success: true,
        data: {
          activities,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取活動記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取活動記錄時發生錯誤'
      });
    }
  }
);

// 家屬留言
router.post('/elderly/:elderlyId/message', 
  validateMongoId('elderlyId'),
  async (req, res) => {
    try {
      const Elderly = require('../models/Elderly');
      const { sendNotification } = require('../utils/notification');
      const { elderlyId } = req.params;
      const { message, type = 'general' } = req.body;

      // 檢查是否為家屬
      const elderly = await Elderly.findById(elderlyId)
        .populate('familyMembers.user');
      
      if (!elderly) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的長者'
        });
      }

      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user._id.toString() === req.user._id.toString()
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權對此長者留言'
        });
      }

      // 這裡可以建立一個專門的留言模型
      // 目前只是模擬儲存
      const messageData = {
        elderly: elderlyId,
        family: req.user._id,
        message,
        type,
        createdAt: new Date()
      };

      // 通知相關照護人員
      const notification = {
        type: 'family_message',
        title: '家屬留言',
        message: `${req.user.name} 對 ${elderly.name} 留言：${message}`,
        data: {
          elderlyId: elderly._id,
          elderlyName: elderly.name,
          familyName: req.user.name,
          message: message
        }
      };

      // 通知管理員和護理師
      const User = require('../models/User');
      const staff = await User.find({
        role: { $in: ['admin', 'nurse'] },
        isActive: true
      });

      for (const user of staff) {
        await sendNotification(user, notification);
      }

      res.status(201).json({
        success: true,
        message: '留言發送成功',
        data: { message: messageData }
      });
    } catch (error) {
      console.error('家屬留言錯誤:', error);
      res.status(500).json({
        success: false,
        message: '發送留言時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 獲取家屬通知設定
router.get('/notification-settings', 
  async (req, res) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user._id)
        .select('notificationSettings');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到用戶資料'
        });
      }

      res.json({
        success: true,
        data: { 
          notificationSettings: user.notificationSettings 
        }
      });
    } catch (error) {
      console.error('獲取通知設定錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取通知設定時發生錯誤'
      });
    }
  }
);

// 更新家屬通知設定
router.put('/notification-settings', 
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { notificationSettings } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { notificationSettings },
        { new: true, runValidators: true }
      ).select('notificationSettings');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到用戶資料'
        });
      }

      res.json({
        success: true,
        message: '通知設定更新成功',
        data: { notificationSettings: user.notificationSettings }
      });
    } catch (error) {
      console.error('更新通知設定錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新通知設定時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 註冊推播 Token
router.post('/push-token', 
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { token, platform } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到用戶資料'
        });
      }

      // 檢查是否已存在相同的 token
      const existingToken = user.pushTokens.find(t => t.token === token);
      
      if (!existingToken) {
        user.pushTokens.push({
          token,
          platform: platform || 'web'
        });
        await user.save();
      }

      res.json({
        success: true,
        message: '推播 Token 註冊成功'
      });
    } catch (error) {
      console.error('註冊推播 Token 錯誤:', error);
      res.status(500).json({
        success: false,
        message: '註冊推播 Token 時發生錯誤'
      });
    }
  }
);

// 移除推播 Token
router.delete('/push-token/:token', 
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { token } = req.params;

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到用戶資料'
        });
      }

      user.pushTokens = user.pushTokens.filter(t => t.token !== token);
      await user.save();

      res.json({
        success: true,
        message: '推播 Token 移除成功'
      });
    } catch (error) {
      console.error('移除推播 Token 錯誤:', error);
      res.status(500).json({
        success: false,
        message: '移除推播 Token 時發生錯誤'
      });
    }
  }
);

module.exports = router;

