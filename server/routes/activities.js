const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateActivity, validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取活動列表
router.get('/', 
  validatePagination,
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { 
        page = 1, 
        limit = 10, 
        type = '', 
        category = '', 
        status = '',
        startDate = '',
        endDate = ''
      } = req.query;

      const query = { isActive: true };
      
      if (type) query.type = type;
      if (category) query.category = category;
      if (status) query.status = status;

      if (startDate || endDate) {
        query['schedule.date'] = {};
        if (startDate) query['schedule.date'].$gte = new Date(startDate);
        if (endDate) query['schedule.date'].$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const activities = await Activity.find(query)
        .populate('staff.leader', 'name role')
        .populate('staff.assistants', 'name role')
        .populate('participants.elderly', 'name idNumber photo')
        .sort({ 'schedule.date': -1, 'schedule.startTime': 1 })
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
      console.error('獲取活動列表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取活動列表時發生錯誤'
      });
    }
  }
);

// 獲取單一活動
router.get('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const activity = await Activity.findById(req.params.id)
        .populate('staff.leader', 'name role email phone')
        .populate('staff.assistants', 'name role email phone')
        .populate('participants.elderly', 'name idNumber photo')
        .populate('evaluation.participantFeedback.elderly', 'name photo');

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      res.json({
        success: true,
        data: { activity }
      });
    } catch (error) {
      console.error('獲取活動錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取活動時發生錯誤'
      });
    }
  }
);

// 建立新活動
router.post('/', 
  requireRole('admin', 'nurse'),
  validateActivity,
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const activityData = req.body;

      const activity = new Activity(activityData);
      await activity.save();

      res.status(201).json({
        success: true,
        message: '活動建立成功',
        data: { activity }
      });
    } catch (error) {
      console.error('建立活動錯誤:', error);
      res.status(500).json({
        success: false,
        message: '建立活動時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 更新活動
router.put('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const updateData = req.body;

      const activity = await Activity.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      res.json({
        success: true,
        message: '活動更新成功',
        data: { activity }
      });
    } catch (error) {
      console.error('更新活動錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新活動時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 刪除活動
router.delete('/:id', 
  requireRole('admin', 'nurse'),
  validateMongoId('id'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const activity = await Activity.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      res.json({
        success: true,
        message: '活動已刪除'
      });
    } catch (error) {
      console.error('刪除活動錯誤:', error);
      res.status(500).json({
        success: false,
        message: '刪除活動時發生錯誤'
      });
    }
  }
);

// 報名活動
router.post('/:id/register', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { elderlyId, notes = '' } = req.body;

      const activity = await Activity.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      // 檢查是否已經報名
      const existingParticipant = activity.participants.find(p => 
        p.elderly.toString() === elderlyId
      );

      if (existingParticipant) {
        return res.status(400).json({
          success: false,
          message: '此長者已經報名此活動'
        });
      }

      // 檢查活動容量
      if (activity.participants.length >= activity.location.capacity) {
        return res.status(400).json({
          success: false,
          message: '活動已額滿'
        });
      }

      // 新增參與者
      activity.participants.push({
        elderly: elderlyId,
        registeredAt: new Date(),
        status: 'registered',
        notes
      });

      await activity.save();

      res.json({
        success: true,
        message: '活動報名成功',
        data: { activity }
      });
    } catch (error) {
      console.error('活動報名錯誤:', error);
      res.status(500).json({
        success: false,
        message: '活動報名時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 取消報名
router.delete('/:id/register/:participantId', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { id, participantId } = req.params;

      const activity = await Activity.findById(id);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      const participantIndex = activity.participants.findIndex(p => 
        p._id.toString() === participantId
      );

      if (participantIndex === -1) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的參與者'
        });
      }

      activity.participants.splice(participantIndex, 1);
      await activity.save();

      res.json({
        success: true,
        message: '取消報名成功',
        data: { activity }
      });
    } catch (error) {
      console.error('取消報名錯誤:', error);
      res.status(500).json({
        success: false,
        message: '取消報名時發生錯誤'
      });
    }
  }
);

// 更新參與狀態
router.put('/:id/participants/:participantId', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { id, participantId } = req.params;
      const { status, notes } = req.body;

      const activity = await Activity.findById(id);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      const participant = activity.participants.find(p => 
        p._id.toString() === participantId
      );

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的參與者'
        });
      }

      participant.status = status;
      if (notes) participant.notes = notes;

      await activity.save();

      res.json({
        success: true,
        message: '參與狀態更新成功',
        data: { activity }
      });
    } catch (error) {
      console.error('更新參與狀態錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新參與狀態時發生錯誤'
      });
    }
  }
);

// 開始活動
router.put('/:id/start', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      if (activity.status !== 'planned') {
        return res.status(400).json({
          success: false,
          message: '活動狀態不正確，無法開始'
        });
      }

      activity.status = 'ongoing';
      activity.execution.actualStartTime = new Date();
      await activity.save();

      res.json({
        success: true,
        message: '活動已開始',
        data: { activity }
      });
    } catch (error) {
      console.error('開始活動錯誤:', error);
      res.status(500).json({
        success: false,
        message: '開始活動時發生錯誤'
      });
    }
  }
);

// 結束活動
router.put('/:id/end', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { notes, issues, improvements } = req.body;

      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      if (activity.status !== 'ongoing') {
        return res.status(400).json({
          success: false,
          message: '活動狀態不正確，無法結束'
        });
      }

      const now = new Date();
      const actualDuration = activity.execution.actualStartTime ? 
        Math.round((now - activity.execution.actualStartTime) / (1000 * 60)) : 0;

      activity.status = 'completed';
      activity.execution.actualEndTime = now;
      activity.execution.actualDuration = actualDuration;
      activity.execution.attendanceCount = activity.participants.filter(p => p.status === 'attended').length;
      
      if (notes) activity.execution.notes = notes;
      if (issues) activity.execution.issues = issues;
      if (improvements) activity.execution.improvements = improvements;

      await activity.save();

      res.json({
        success: true,
        message: '活動已結束',
        data: { activity }
      });
    } catch (error) {
      console.error('結束活動錯誤:', error);
      res.status(500).json({
        success: false,
        message: '結束活動時發生錯誤'
      });
    }
  }
);

// 提交活動評估
router.post('/:id/evaluation', 
  requireRole('admin', 'nurse', 'caregiver'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { rating, comments } = req.body;

      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的活動'
        });
      }

      activity.evaluation.staffFeedback = {
        rating,
        comments,
        submittedBy: req.user._id,
        submittedAt: new Date()
      };

      await activity.save();

      res.json({
        success: true,
        message: '活動評估提交成功',
        data: { activity }
      });
    } catch (error) {
      console.error('提交活動評估錯誤:', error);
      res.status(500).json({
        success: false,
        message: '提交活動評估時發生錯誤'
      });
    }
  }
);

// 獲取活動統計
router.get('/stats/overview', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const Activity = require('../models/Activity');
      const { startDate, endDate } = req.query;

      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);

      const query = { isActive: true };
      if (Object.keys(dateQuery).length > 0) {
        query['schedule.date'] = dateQuery;
      }

      // 活動類型統計
      const typeStats = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      // 活動狀態統計
      const statusStats = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // 參與率統計
      const participationStats = await Activity.aggregate([
        { $match: { ...query, status: 'completed' } },
        {
          $project: {
            totalParticipants: { $size: '$participants' },
            attendedParticipants: {
              $size: {
                $filter: {
                  input: '$participants',
                  cond: { $eq: ['$$this.status', 'attended'] }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            totalParticipants: { $sum: '$totalParticipants' },
            totalAttended: { $sum: '$attendedParticipants' },
            avgParticipationRate: {
              $avg: {
                $cond: [
                  { $gt: ['$totalParticipants', 0] },
                  { $multiply: [{ $divide: ['$attendedParticipants', '$totalParticipants'] }, 100] },
                  0
                ]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          typeStats,
          statusStats,
          participationStats: participationStats[0] || {}
        }
      });
    } catch (error) {
      console.error('獲取活動統計錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取活動統計時發生錯誤'
      });
    }
  }
);

module.exports = router;

