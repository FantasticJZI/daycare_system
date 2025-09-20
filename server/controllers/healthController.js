const HealthRecord = require('../models/HealthRecord');
const Elderly = require('../models/Elderly');
const { sendHealthAlert } = require('../utils/notification');

// 獲取長者的健康記錄
const getHealthRecords = async (req, res) => {
  try {
    const { elderlyId } = req.params;
    const {
      page = 1,
      limit = 10,
      recordType = '',
      startDate = '',
      endDate = '',
      sortBy = 'recordDate',
      sortOrder = 'desc'
    } = req.query;

    // 建立查詢條件
    const query = { elderly: elderlyId };
    
    if (recordType) {
      query.recordType = recordType;
    }

    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) query.recordDate.$gte = new Date(startDate);
      if (endDate) query.recordDate.$lte = new Date(endDate);
    }

    // 排序設定
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 分頁查詢
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const healthRecords = await HealthRecord.find(query)
      .populate('recordedBy', 'name role')
      .populate('reviewedBy', 'name role')
      .sort(sort)
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
      message: '獲取健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 獲取單一健康記錄
const getHealthRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const healthRecord = await HealthRecord.findById(id)
      .populate('elderly', 'name idNumber photo')
      .populate('recordedBy', 'name role')
      .populate('reviewedBy', 'name role');

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的健康記錄'
      });
    }

    res.json({
      success: true,
      data: { healthRecord }
    });
  } catch (error) {
    console.error('獲取健康記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 建立健康記錄
const createHealthRecord = async (req, res) => {
  try {
    const healthRecordData = req.body;
    healthRecordData.recordedBy = req.user._id;

    const healthRecord = new HealthRecord(healthRecordData);
    await healthRecord.save();

    // 獲取長者資料
    const elderly = await Elderly.findById(healthRecord.elderly)
      .populate('familyMembers.user');

    // 檢查是否有異常數據需要通知
    if (healthRecord.isAbnormal && healthRecord.notifyFamily) {
      const familyMembers = elderly.familyMembers.filter(member => 
        member.canReceiveNotifications
      );
      
      if (familyMembers.length > 0) {
        await sendHealthAlert(elderly, healthRecord, familyMembers);
        healthRecord.notificationSent = true;
        await healthRecord.save();
      }
    }

    res.status(201).json({
      success: true,
      message: '健康記錄建立成功',
      data: { healthRecord }
    });
  } catch (error) {
    console.error('建立健康記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 更新健康記錄
const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const healthRecord = await HealthRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('elderly', 'name idNumber');

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的健康記錄'
      });
    }

    res.json({
      success: true,
      message: '健康記錄更新成功',
      data: { healthRecord }
    });
  } catch (error) {
    console.error('更新健康記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 刪除健康記錄
const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const healthRecord = await HealthRecord.findByIdAndDelete(id);

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的健康記錄'
      });
    }

    res.json({
      success: true,
      message: '健康記錄刪除成功'
    });
  } catch (error) {
    console.error('刪除健康記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 審核健康記錄
const reviewHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const healthRecord = await HealthRecord.findByIdAndUpdate(
      id,
      {
        status: 'reviewed',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewNotes
      },
      { new: true, runValidators: true }
    );

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的健康記錄'
      });
    }

    res.json({
      success: true,
      message: '健康記錄審核完成',
      data: { healthRecord }
    });
  } catch (error) {
    console.error('審核健康記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '審核健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 獲取健康統計資料
const getHealthStats = async (req, res) => {
  try {
    const { elderlyId } = req.params;
    const { startDate, endDate } = req.query;

    // 建立日期範圍查詢
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    const query = { elderly: elderlyId };
    if (Object.keys(dateQuery).length > 0) {
      query.recordDate = dateQuery;
    }

    // 生命徵象統計
    const vitalSignsStats = await HealthRecord.aggregate([
      { $match: { ...query, recordType: 'vital_signs' } },
      {
        $group: {
          _id: null,
          avgSystolic: { $avg: '$vitalSigns.bloodPressure.systolic' },
          avgDiastolic: { $avg: '$vitalSigns.bloodPressure.diastolic' },
          avgHeartRate: { $avg: '$vitalSigns.heartRate.value' },
          avgTemperature: { $avg: '$vitalSigns.temperature.value' },
          avgBloodSugar: { $avg: '$vitalSigns.bloodSugar.value' },
          avgOxygenSaturation: { $avg: '$vitalSigns.oxygenSaturation.value' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 異常記錄統計
    const abnormalCount = await HealthRecord.countDocuments({
      ...query,
      $or: [
        { 'vitalSigns.bloodPressure.systolic': { $gt: 140 } },
        { 'vitalSigns.bloodPressure.diastolic': { $gt: 90 } },
        { 'vitalSigns.bloodPressure.systolic': { $lt: 90 } },
        { 'vitalSigns.bloodPressure.diastolic': { $lt: 60 } },
        { 'vitalSigns.heartRate.value': { $gt: 100 } },
        { 'vitalSigns.heartRate.value': { $lt: 60 } },
        { 'vitalSigns.temperature.value': { $gt: 37.5 } },
        { 'vitalSigns.temperature.value': { $lt: 36.0 } },
        { 'vitalSigns.bloodSugar.value': { $gt: 200 } },
        { 'vitalSigns.bloodSugar.value': { $lt: 70 } },
        { 'vitalSigns.oxygenSaturation.value': { $lt: 95 } }
      ]
    });

    // 記錄類型分佈
    const recordTypeStats = await HealthRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 最近7天的記錄趨勢
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrends = await HealthRecord.aggregate([
      {
        $match: {
          ...query,
          recordDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$recordDate'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        vitalSignsStats: vitalSignsStats[0] || {},
        abnormalCount,
        recordTypeStats,
        recentTrends
      }
    });
  } catch (error) {
    console.error('獲取健康統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取健康統計時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 獲取異常健康記錄
const getAbnormalHealthRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      elderlyId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // 建立查詢條件
    const query = {
      $or: [
        { 'vitalSigns.bloodPressure.systolic': { $gt: 140 } },
        { 'vitalSigns.bloodPressure.diastolic': { $gt: 90 } },
        { 'vitalSigns.bloodPressure.systolic': { $lt: 90 } },
        { 'vitalSigns.bloodPressure.diastolic': { $lt: 60 } },
        { 'vitalSigns.heartRate.value': { $gt: 100 } },
        { 'vitalSigns.heartRate.value': { $lt: 60 } },
        { 'vitalSigns.temperature.value': { $gt: 37.5 } },
        { 'vitalSigns.temperature.value': { $lt: 36.0 } },
        { 'vitalSigns.bloodSugar.value': { $gt: 200 } },
        { 'vitalSigns.bloodSugar.value': { $lt: 70 } },
        { 'vitalSigns.oxygenSaturation.value': { $lt: 95 } }
      ]
    };

    if (elderlyId) {
      query.elderly = elderlyId;
    }

    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) query.recordDate.$gte = new Date(startDate);
      if (endDate) query.recordDate.$lte = new Date(endDate);
    }

    // 分頁查詢
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const healthRecords = await HealthRecord.find(query)
      .populate('elderly', 'name idNumber photo')
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
    console.error('獲取異常健康記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取異常健康記錄時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

module.exports = {
  getHealthRecords,
  getHealthRecordById,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  reviewHealthRecord,
  getHealthStats,
  getAbnormalHealthRecords
};

