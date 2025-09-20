const axios = require('axios');

// 發送 LINE 通知
const sendLineNotification = async (userId, message) => {
  try {
    const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      console.warn('LINE_CHANNEL_ACCESS_TOKEN 未設定，跳過 LINE 通知');
      return;
    }

    // 在實際應用中，需要先建立用戶與 LINE 的關聯
    // 這裡假設我們有 userId 對應的 LINE userId
    const lineUserId = await getLineUserId(userId);
    
    if (!lineUserId) {
      console.warn(`用戶 ${userId} 未綁定 LINE`);
      return;
    }

    const response = await axios.post('https://api.line.me/v2/bot/message/push', {
      to: lineUserId,
      messages: [{
        type: 'text',
        text: message
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('LINE 通知發送成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('LINE 通知發送失敗:', error.response?.data || error.message);
    throw error;
  }
};

// 發送推播通知
const sendPushNotification = async (pushTokens, title, body, data = {}) => {
  try {
    const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
    
    if (!FCM_SERVER_KEY) {
      console.warn('FCM_SERVER_KEY 未設定，跳過推播通知');
      return;
    }

    if (!pushTokens || pushTokens.length === 0) {
      console.warn('沒有推播 token，跳過推播通知');
      return;
    }

    const message = {
      registration_ids: pushTokens,
      notification: {
        title,
        body,
        sound: 'default'
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    };

    const response = await axios.post('https://fcm.googleapis.com/fcm/send', message, {
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('推播通知發送成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('推播通知發送失敗:', error.response?.data || error.message);
    throw error;
  }
};

// 發送簡訊通知
const sendSMSNotification = async (phoneNumber, message) => {
  try {
    // 這裡可以整合第三方簡訊服務，如 Twilio、AWS SNS 等
    // 目前只是模擬發送
    console.log(`發送簡訊到 ${phoneNumber}: ${message}`);
    
    // 實際實作範例（使用 Twilio）：
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('簡訊發送成功:', result.sid);
    return result;
    */
    
    return { success: true, message: '簡訊發送成功（模擬）' };
  } catch (error) {
    console.error('簡訊發送失敗:', error);
    throw error;
  }
};

// 統一通知發送函數
const sendNotification = async (user, notification) => {
  try {
    const { type, title, message, data = {} } = notification;
    const results = [];

    // 根據用戶的通知設定發送通知
    if (user.notificationSettings?.email && user.email) {
      try {
        const { sendEmail } = require('./email');
        await sendEmail({
          to: user.email,
          subject: title,
          html: `
            <h2>${title}</h2>
            <p>${message}</p>
            ${data.html || ''}
          `
        });
        results.push({ type: 'email', success: true });
      } catch (error) {
        console.error('郵件通知發送失敗:', error);
        results.push({ type: 'email', success: false, error: error.message });
      }
    }

    if (user.notificationSettings?.sms && user.phone) {
      try {
        await sendSMSNotification(user.phone, `${title}: ${message}`);
        results.push({ type: 'sms', success: true });
      } catch (error) {
        console.error('簡訊通知發送失敗:', error);
        results.push({ type: 'sms', success: false, error: error.message });
      }
    }

    if (user.notificationSettings?.push && user.pushTokens?.length > 0) {
      try {
        const pushTokens = user.pushTokens.map(token => token.token);
        await sendPushNotification(pushTokens, title, message, data);
        results.push({ type: 'push', success: true });
      } catch (error) {
        console.error('推播通知發送失敗:', error);
        results.push({ type: 'push', success: false, error: error.message });
      }
    }

    if (user.notificationSettings?.line) {
      try {
        await sendLineNotification(user._id, `${title}: ${message}`);
        results.push({ type: 'line', success: true });
      } catch (error) {
        console.error('LINE 通知發送失敗:', error);
        results.push({ type: 'line', success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('通知發送失敗:', error);
    throw error;
  }
};

// 發送健康異常通知
const sendHealthAlert = async (elderly, healthRecord, familyMembers) => {
  try {
    const notification = {
      type: 'health_alert',
      title: '⚠️ 健康異常通知',
      message: `${elderly.name} 的健康數據出現異常，請關注`,
      data: {
        elderlyId: elderly._id,
        healthRecordId: healthRecord._id,
        recordType: healthRecord.recordType,
        isAbnormal: healthRecord.isAbnormal
      }
    };

    const results = [];
    for (const member of familyMembers) {
      if (member.canReceiveNotifications) {
        const result = await sendNotification(member.user, notification);
        results.push(...result);
      }
    }

    return results;
  } catch (error) {
    console.error('健康異常通知發送失敗:', error);
    throw error;
  }
};

// 發送出勤通知
const sendAttendanceNotification = async (elderly, attendance, familyMembers) => {
  try {
    const statusMessages = {
      present: '正常出勤',
      absent: '缺勤',
      late: '遲到',
      early_leave: '早退',
      sick_leave: '病假',
      personal_leave: '事假'
    };

    const notification = {
      type: 'attendance',
      title: '📅 出勤通知',
      message: `${elderly.name} 今日${statusMessages[attendance.status] || attendance.status}`,
      data: {
        elderlyId: elderly._id,
        attendanceId: attendance._id,
        status: attendance.status,
        date: attendance.date
      }
    };

    const results = [];
    for (const member of familyMembers) {
      if (member.canReceiveNotifications) {
        const result = await sendNotification(member.user, notification);
        results.push(...result);
      }
    }

    return results;
  } catch (error) {
    console.error('出勤通知發送失敗:', error);
    throw error;
  }
};

// 發送活動通知
const sendActivityNotification = async (activity, participants) => {
  try {
    const notification = {
      type: 'activity',
      title: '🎯 活動通知',
      message: `活動「${activity.name}」即將開始`,
      data: {
        activityId: activity._id,
        activityName: activity.name,
        startTime: activity.schedule.startTime,
        location: activity.location.name
      }
    };

    const results = [];
    for (const participant of participants) {
      if (participant.elderly) {
        // 通知家屬
        const familyMembers = participant.elderly.familyMembers || [];
        for (const member of familyMembers) {
          if (member.canReceiveNotifications) {
            const result = await sendNotification(member.user, notification);
            results.push(...result);
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('活動通知發送失敗:', error);
    throw error;
  }
};

// 發送緊急通知
const sendEmergencyNotification = async (elderly, incident, familyMembers) => {
  try {
    const notification = {
      type: 'emergency',
      title: '🚨 緊急通知',
      message: `${elderly.name} 發生緊急事件：${incident.description}`,
      data: {
        elderlyId: elderly._id,
        incidentId: incident._id,
        severity: incident.severity,
        time: incident.time
      }
    };

    const results = [];
    for (const member of familyMembers) {
      if (member.canReceiveNotifications) {
        const result = await sendNotification(member.user, notification);
        results.push(...result);
      }
    }

    return results;
  } catch (error) {
    console.error('緊急通知發送失敗:', error);
    throw error;
  }
};

// 輔助函數：獲取用戶的 LINE User ID
const getLineUserId = async (userId) => {
  // 在實際應用中，需要從資料庫中查詢用戶的 LINE User ID
  // 這裡只是模擬
  return null;
};

module.exports = {
  sendNotification,
  sendHealthAlert,
  sendAttendanceNotification,
  sendActivityNotification,
  sendEmergencyNotification,
  sendLineNotification,
  sendPushNotification,
  sendSMSNotification
};

