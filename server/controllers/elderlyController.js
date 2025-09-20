const Elderly = require('../models/Elderly');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const { sendNotification } = require('../utils/notification');

// 獲取所有長者列表
const getAllElderly = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 建立查詢條件
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.serviceStatus = status;
    }

    // 排序設定
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 分頁查詢
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const elderly = await Elderly.find(query)
      .populate('familyMembers.user', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Elderly.countDocuments(query);

    res.json({
      success: true,
      data: {
        elderly,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('獲取長者列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取長者列表時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 獲取單一長者資料
const getElderlyById = async (req, res) => {
  try {
    const { id } = req.params;

    const elderly = await Elderly.findById(id)
      .populate('familyMembers.user', 'name email phone avatar')
      .populate('longTermCareAssessment.assessor', 'name role');

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的長者'
      });
    }

    // 檢查權限（家屬只能查看自己的長者）
    if (req.user.role === 'family') {
      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user._id.toString() === req.user._id.toString()
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權查看此長者的資料'
        });
      }
    }

    res.json({
      success: true,
      data: { elderly }
    });
  } catch (error) {
    console.error('獲取長者資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取長者資料時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 建立新長者
const createElderly = async (req, res) => {
  try {
    const elderlyData = req.body;
    elderlyData.createdBy = req.user._id;

    const elderly = new Elderly(elderlyData);
    await elderly.save();

    // 發送通知給相關人員
    const notification = {
      type: 'elderly_registered',
      title: '新長者註冊',
      message: `新長者 ${elderly.name} 已註冊到系統`,
      data: {
        elderlyId: elderly._id,
        elderlyName: elderly.name
      }
    };

    // 通知管理員和護理師
    const staff = await User.find({
      role: { $in: ['admin', 'nurse'] },
      isActive: true
    });

    for (const user of staff) {
      await sendNotification(user, notification);
    }

    res.status(201).json({
      success: true,
      message: '長者資料建立成功',
      data: { elderly }
    });
  } catch (error) {
    console.error('建立長者資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立長者資料時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 更新長者資料
const updateElderly = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.lastModifiedBy = req.user._id;

    const elderly = await Elderly.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('familyMembers.user', 'name email phone');

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的長者'
      });
    }

    // 通知家屬資料已更新
    const notification = {
      type: 'elderly_updated',
      title: '長者資料更新',
      message: `${elderly.name} 的資料已更新`,
      data: {
        elderlyId: elderly._id,
        elderlyName: elderly.name
      }
    };

    for (const member of elderly.familyMembers) {
      if (member.canReceiveNotifications) {
        await sendNotification(member.user, notification);
      }
    }

    res.json({
      success: true,
      message: '長者資料更新成功',
      data: { elderly }
    });
  } catch (error) {
    console.error('更新長者資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新長者資料時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 刪除長者（軟刪除）
const deleteElderly = async (req, res) => {
  try {
    const { id } = req.params;

    const elderly = await Elderly.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        serviceStatus: 'terminated',
        serviceEndDate: new Date(),
        lastModifiedBy: req.user._id
      },
      { new: true }
    );

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的長者'
      });
    }

    // 通知家屬
    const notification = {
      type: 'elderly_terminated',
      title: '服務終止通知',
      message: `${elderly.name} 的服務已終止`,
      data: {
        elderlyId: elderly._id,
        elderlyName: elderly.name
      }
    };

    for (const member of elderly.familyMembers) {
      if (member.canReceiveNotifications) {
        await sendNotification(member.user, notification);
      }
    }

    res.json({
      success: true,
      message: '長者資料已刪除'
    });
  } catch (error) {
    console.error('刪除長者資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除長者資料時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 新增家屬
const addFamilyMember = async (req, res) => {
  try {
    const { elderlyId } = req.params;
    const { userId, relationship, isPrimary, canViewHealthData, canReceiveNotifications } = req.body;

    const elderly = await Elderly.findById(elderlyId);
    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的長者'
      });
    }

    // 檢查用戶是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的用戶'
      });
    }

    // 檢查是否已經是家屬
    const existingMember = elderly.familyMembers.find(member => 
      member.user.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: '此用戶已經是家屬'
      });
    }

    // 新增家屬
    elderly.familyMembers.push({
      user: userId,
      relationship,
      isPrimary: isPrimary || false,
      canViewHealthData: canViewHealthData !== false,
      canReceiveNotifications: canReceiveNotifications !== false
    });

    await elderly.save();

    // 更新用戶的相關長者列表
    user.relatedElderly.push({
      elderly: elderlyId,
      relationship
    });
    await user.save();

    // 通知新家屬
    const notification = {
      type: 'family_member_added',
      title: '家屬權限新增',
      message: `您已被新增為 ${elderly.name} 的家屬`,
      data: {
        elderlyId: elderly._id,
        elderlyName: elderly.name
      }
    };

    await sendNotification(user, notification);

    res.json({
      success: true,
      message: '家屬新增成功',
      data: { elderly }
    });
  } catch (error) {
    console.error('新增家屬錯誤:', error);
    res.status(500).json({
      success: false,
      message: '新增家屬時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 移除家屬
const removeFamilyMember = async (req, res) => {
  try {
    const { elderlyId, memberId } = req.params;

    const elderly = await Elderly.findById(elderlyId);
    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的長者'
      });
    }

    const memberIndex = elderly.familyMembers.findIndex(member => 
      member._id.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的家屬'
      });
    }

    const member = elderly.familyMembers[memberIndex];
    
    // 移除家屬
    elderly.familyMembers.splice(memberIndex, 1);
    await elderly.save();

    // 更新用戶的相關長者列表
    await User.findByIdAndUpdate(member.user, {
      $pull: { relatedElderly: { elderly: elderlyId } }
    });

    res.json({
      success: true,
      message: '家屬移除成功',
      data: { elderly }
    });
  } catch (error) {
    console.error('移除家屬錯誤:', error);
    res.status(500).json({
      success: false,
      message: '移除家屬時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 更新長照評估
const updateCareAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessmentData = req.body;
    assessmentData.assessor = req.user._id;
    assessmentData.assessmentDate = new Date();

    const elderly = await Elderly.findByIdAndUpdate(
      id,
      { longTermCareAssessment: assessmentData },
      { new: true, runValidators: true }
    );

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的長者'
      });
    }

    res.json({
      success: true,
      message: '長照評估更新成功',
      data: { elderly }
    });
  } catch (error) {
    console.error('更新長照評估錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新長照評估時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 獲取長者統計資料
const getElderlyStats = async (req, res) => {
  try {
    const totalElderly = await Elderly.countDocuments({ isActive: true });
    const activeElderly = await Elderly.countDocuments({ 
      isActive: true, 
      serviceStatus: 'active' 
    });
    const waitingElderly = await Elderly.countDocuments({ 
      isActive: true, 
      serviceStatus: 'waiting' 
    });
    const suspendedElderly = await Elderly.countDocuments({ 
      isActive: true, 
      serviceStatus: 'suspended' 
    });

    // 年齡分佈
    const ageGroups = await Elderly.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: [{ $year: { $subtract: [new Date(), '$birthDate'] } }, 70] }, then: '65-69' },
                { case: { $lt: [{ $year: { $subtract: [new Date(), '$birthDate'] } }, 75] }, then: '70-74' },
                { case: { $lt: [{ $year: { $subtract: [new Date(), '$birthDate'] } }, 80] }, then: '75-79' },
                { case: { $lt: [{ $year: { $subtract: [new Date(), '$birthDate'] } }, 85] }, then: '80-84' },
                { case: { $gte: [{ $year: { $subtract: [new Date(), '$birthDate'] } }, 85] }, then: '85+' }
              ],
              default: 'unknown'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 照護等級分佈
    const careLevels = await Elderly.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$longTermCareAssessment.careLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalElderly,
        active: activeElderly,
        waiting: waitingElderly,
        suspended: suspendedElderly,
        ageGroups,
        careLevels
      }
    });
  } catch (error) {
    console.error('獲取長者統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取長者統計時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

module.exports = {
  getAllElderly,
  getElderlyById,
  createElderly,
  updateElderly,
  deleteElderly,
  addFamilyMember,
  removeFamilyMember,
  updateCareAssessment,
  getElderlyStats
};

