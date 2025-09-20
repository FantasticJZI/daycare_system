const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { sendNotification } = require('../utils/notification');

// 生成 JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// 註冊
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, employeeId, department, position } = req.body;

    // 檢查電子郵件是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此電子郵件已被註冊'
      });
    }

    // 檢查員工編號是否已存在（如果提供）
    if (employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: '此員工編號已被使用'
        });
      }
    }

    // 建立新用戶
    const user = new User({
      name,
      email,
      password,
      phone,
      role,
      employeeId,
      department,
      position,
      hireDate: new Date()
    });

    await user.save();

    // 生成 JWT Token
    const token = generateToken(user._id);

    // 移除密碼後返回用戶資料
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: '註冊成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '註冊過程中發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 登入
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // 查找用戶（包含密碼）
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '電子郵件或密碼錯誤'
      });
    }

    // 檢查帳戶是否被鎖定
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: '帳戶已被鎖定，請聯繫管理員'
      });
    }

    // 檢查帳戶是否活躍
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '帳戶已被停用'
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // 增加登入嘗試次數
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: '電子郵件或密碼錯誤'
      });
    }

    // 重置登入嘗試次數
    await user.resetLoginAttempts();

    // 更新最後登入時間
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT Token
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // 移除密碼後返回用戶資料
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: '登入成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入過程中發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 登出
const logout = async (req, res) => {
  try {
    // 在實際應用中，可以在這裡將 token 加入黑名單
    // 或者清除客戶端的 token
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登出過程中發生錯誤'
    });
  }
};

// 獲取當前用戶資料
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('relatedElderly.elderly', 'name idNumber photo')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶資料時發生錯誤'
    });
  }
};

// 更新用戶資料
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, emergencyContact, notificationSettings } = req.body;
    const userId = req.user._id;

    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (notificationSettings) updateData.notificationSettings = notificationSettings;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    res.json({
      success: true,
      message: '資料更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新用戶資料時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 修改密碼
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // 獲取用戶（包含密碼）
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    // 驗證目前密碼
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '目前密碼錯誤'
      });
    }

    // 更新密碼
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密碼修改成功'
    });
  } catch (error) {
    console.error('修改密碼錯誤:', error);
    res.status(500).json({
      success: false,
      message: '修改密碼時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 忘記密碼
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到此電子郵件對應的帳戶'
      });
    }

    // 生成重設密碼 token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 儲存重設 token（在實際應用中應該儲存在資料庫中）
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1小時後過期
    await user.save();

    // 發送重設密碼郵件
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: '重設密碼',
      html: `
        <h2>重設密碼</h2>
        <p>您好 ${user.name}，</p>
        <p>請點擊以下連結重設您的密碼：</p>
        <a href="${resetUrl}">重設密碼</a>
        <p>此連結將在1小時後過期。</p>
        <p>如果您沒有要求重設密碼，請忽略此郵件。</p>
      `
    });

    res.json({
      success: true,
      message: '重設密碼郵件已發送，請檢查您的電子郵件'
    });
  } catch (error) {
    console.error('忘記密碼錯誤:', error);
    res.status(500).json({
      success: false,
      message: '發送重設密碼郵件時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 重設密碼
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 驗證重設 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: '無效的重設密碼連結'
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '重設密碼連結已過期或無效'
      });
    }

    // 更新密碼
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: '密碼重設成功'
    });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({
      success: false,
      message: '重設密碼時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
    });
  }
};

// 刷新 Token
const refreshToken = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 生成新的 token
    const token = generateToken(userId);

    res.json({
      success: true,
      message: 'Token 刷新成功',
      data: { token }
    });
  } catch (error) {
    console.error('刷新 Token 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刷新 Token 時發生錯誤'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken
};

