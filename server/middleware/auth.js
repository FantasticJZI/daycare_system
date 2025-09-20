const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 認證中間件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '存取被拒絕，未提供認證令牌'
      });
    }

    // 驗證 JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查詢用戶是否存在且活躍
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '無效的認證令牌'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '帳戶已被停用'
      });
    }

    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: '帳戶已被鎖定，請聯繫管理員'
      });
    }

    // 將用戶資訊附加到請求物件
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '無效的認證令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '認證令牌已過期'
      });
    }

    console.error('認證錯誤:', error);
    res.status(500).json({
      success: false,
      message: '認證過程中發生錯誤'
    });
  }
};

// 角色檢查中間件
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '請先登入'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '權限不足'
      });
    }

    next();
  };
};

// 權限檢查中間件
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '請先登入'
      });
    }

    // 管理員擁有所有權限
    if (req.user.role === 'admin') {
      return next();
    }

    // 檢查特定權限
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `需要 ${permission} 權限`
      });
    }

    next();
  };
};

// 資源擁有者檢查中間件
const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: '資源不存在'
        });
      }

      // 管理員可以存取所有資源
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // 檢查是否為資源擁有者
      let isOwner = false;

      // 檢查直接擁有者
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) {
        isOwner = true;
      }

      // 檢查家屬關係（針對長者相關資源）
      if (resource.elderly && req.user.role === 'family') {
        const elderly = await resourceModel.findById(resource.elderly).populate('familyMembers.user');
        if (elderly && elderly.familyMembers.some(member => 
          member.user.toString() === req.user._id.toString()
        )) {
          isOwner = true;
        }
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: '無權存取此資源'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('所有權檢查錯誤:', error);
      res.status(500).json({
        success: false,
        message: '檢查資源所有權時發生錯誤'
      });
    }
  };
};

// 家屬權限檢查中間件
const requireFamilyAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'nurse' || req.user.role === 'caregiver') {
      return next();
    }

    if (req.user.role === 'family') {
      const elderlyId = req.params.elderlyId || req.body.elderly;
      
      if (!elderlyId) {
        return res.status(400).json({
          success: false,
          message: '缺少長者ID'
        });
      }

      const Elderly = require('../models/Elderly');
      const elderly = await Elderly.findById(elderlyId);
      
      if (!elderly) {
        return res.status(404).json({
          success: false,
          message: '長者不存在'
        });
      }

      // 檢查是否為該長者的家屬
      const isFamilyMember = elderly.familyMembers.some(member => 
        member.user.toString() === req.user._id.toString()
      );

      if (!isFamilyMember) {
        return res.status(403).json({
          success: false,
          message: '無權存取此長者的資料'
        });
      }

      req.elderly = elderly;
    }

    next();
  } catch (error) {
    console.error('家屬權限檢查錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檢查家屬權限時發生錯誤'
    });
  }
};

// 可選認證中間件（不強制要求登入）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可選認證失敗時不中斷請求
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  requireFamilyAccess,
  optionalAuth
};

