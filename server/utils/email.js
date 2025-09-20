const nodemailer = require('nodemailer');

// 建立郵件傳輸器
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// 發送郵件
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"日照系統" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('郵件發送成功:', result.messageId);
    return result;
  } catch (error) {
    console.error('郵件發送失敗:', error);
    throw error;
  }
};

// 發送歡迎郵件
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">歡迎加入日照系統！</h2>
      <p>親愛的 ${user.name}，</p>
      <p>歡迎您加入我們的日照中心管理系統。您的帳戶已成功建立。</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>帳戶資訊</h3>
        <p><strong>姓名：</strong> ${user.name}</p>
        <p><strong>電子郵件：</strong> ${user.email}</p>
        <p><strong>角色：</strong> ${getRoleName(user.role)}</p>
        <p><strong>員工編號：</strong> ${user.employeeId || '未設定'}</p>
      </div>
      
      <p>請妥善保管您的登入資訊，並建議您首次登入後修改密碼。</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/login" 
           style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          立即登入
        </a>
      </div>
      
      <p style="color: #7f8c8d; font-size: 14px;">
        如有任何問題，請聯繫系統管理員。
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: '歡迎加入日照系統',
    html
  });
};

// 發送密碼重設郵件
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">重設密碼</h2>
      <p>親愛的 ${user.name}，</p>
      <p>我們收到了您重設密碼的請求。</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          重設密碼
        </a>
      </div>
      
      <p>此連結將在1小時後過期。如果您沒有要求重設密碼，請忽略此郵件。</p>
      
      <p style="color: #7f8c8d; font-size: 14px;">
        如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
        ${resetUrl}
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: '重設密碼 - 日照系統',
    html
  });
};

// 發送健康異常通知郵件
const sendHealthAlertEmail = async (elderly, healthRecord, familyMembers) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">⚠️ 健康異常通知</h2>
      <p>親愛的家屬，</p>
      <p>我們發現 ${elderly.name} 的健康數據出現異常，請您關注。</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>異常數據</h3>
        <p><strong>記錄時間：</strong> ${new Date(healthRecord.recordDate).toLocaleString('zh-TW')}</p>
        <p><strong>記錄類型：</strong> ${getRecordTypeName(healthRecord.recordType)}</p>
        ${getVitalSignsHtml(healthRecord.vitalSigns)}
      </div>
      
      <p>建議您儘快聯繫日照中心或帶長者就醫檢查。</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/elderly/${elderly._id}/health" 
           style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          查看詳細資料
        </a>
      </div>
      
      <p style="color: #7f8c8d; font-size: 14px;">
        如有緊急情況，請立即聯繫日照中心：${process.env.CENTER_PHONE || '02-1234-5678'}
      </p>
    </div>
  `;

  // 發送給所有家屬
  const emailPromises = familyMembers.map(member => 
    sendEmail({
      to: member.user.email,
      subject: `健康異常通知 - ${elderly.name}`,
      html
    })
  );

  return Promise.all(emailPromises);
};

// 發送出勤通知郵件
const sendAttendanceNotificationEmail = async (elderly, attendance, familyMembers) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">📅 出勤通知</h2>
      <p>親愛的家屬，</p>
      <p>以下是 ${elderly.name} 今日的出勤狀況：</p>
      
      <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3>出勤資訊</h3>
        <p><strong>日期：</strong> ${new Date(attendance.date).toLocaleDateString('zh-TW')}</p>
        <p><strong>狀態：</strong> ${getAttendanceStatusName(attendance.status)}</p>
        ${attendance.checkIn ? `<p><strong>報到時間：</strong> ${new Date(attendance.checkIn.time).toLocaleString('zh-TW')}</p>` : ''}
        ${attendance.checkOut ? `<p><strong>離開時間：</strong> ${new Date(attendance.checkOut.time).toLocaleString('zh-TW')}</p>` : ''}
        ${attendance.notes ? `<p><strong>備註：</strong> ${attendance.notes}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/elderly/${elderly._id}/attendance" 
           style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          查看詳細出勤記錄
        </a>
      </div>
    </div>
  `;

  // 發送給所有家屬
  const emailPromises = familyMembers.map(member => 
    sendEmail({
      to: member.user.email,
      subject: `出勤通知 - ${elderly.name}`,
      html
    })
  );

  return Promise.all(emailPromises);
};

// 輔助函數
const getRoleName = (role) => {
  const roleNames = {
    admin: '系統管理員',
    nurse: '護理師',
    caregiver: '照服員',
    family: '家屬',
    doctor: '醫師顧問'
  };
  return roleNames[role] || role;
};

const getRecordTypeName = (type) => {
  const typeNames = {
    vital_signs: '生命徵象',
    medication: '用藥記錄',
    symptom: '症狀記錄',
    incident: '事件記錄',
    assessment: '評估記錄',
    doctor_visit: '醫師巡診'
  };
  return typeNames[type] || type;
};

const getAttendanceStatusName = (status) => {
  const statusNames = {
    present: '正常出勤',
    absent: '缺勤',
    late: '遲到',
    early_leave: '早退',
    sick_leave: '病假',
    personal_leave: '事假'
  };
  return statusNames[status] || status;
};

const getVitalSignsHtml = (vitalSigns) => {
  if (!vitalSigns) return '';
  
  let html = '';
  
  if (vitalSigns.bloodPressure) {
    html += `<p><strong>血壓：</strong> ${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic} mmHg</p>`;
  }
  
  if (vitalSigns.heartRate) {
    html += `<p><strong>心跳：</strong> ${vitalSigns.heartRate.value} bpm</p>`;
  }
  
  if (vitalSigns.temperature) {
    html += `<p><strong>體溫：</strong> ${vitalSigns.temperature.value}°C</p>`;
  }
  
  if (vitalSigns.bloodSugar) {
    html += `<p><strong>血糖：</strong> ${vitalSigns.bloodSugar.value} mg/dL</p>`;
  }
  
  if (vitalSigns.oxygenSaturation) {
    html += `<p><strong>血氧：</strong> ${vitalSigns.oxygenSaturation.value}%</p>`;
  }
  
  return html;
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendHealthAlertEmail,
  sendAttendanceNotificationEmail
};

