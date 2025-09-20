const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取長照補助報表
router.get('/long-term-care', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // 模擬長照補助報表資料
      const report = {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0]
        },
        summary: {
          totalElderly: 25,
          level1: 5,
          level2: 8,
          level3: 7,
          level4: 3,
          level5: 2,
          totalSubsidy: 125000
        },
        details: [
          {
            elderlyId: 'elderly1',
            name: '張三',
            idNumber: 'A123456789',
            careLevel: 'level2',
            monthlySubsidy: 5000,
            serviceDays: 22,
            totalSubsidy: 5000
          }
        ]
      };

      res.json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('獲取長照補助報表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取長照補助報表時發生錯誤'
      });
    }
  }
);

// 獲取出勤統計報表
router.get('/attendance', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const { startDate, endDate, elderlyId } = req.query;
      
      // 模擬出勤統計報表資料
      const report = {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0]
        },
        summary: {
          totalDays: 22,
          presentDays: 20,
          absentDays: 2,
          attendanceRate: 90.9,
          averageHours: 8.5
        },
        dailyStats: [
          {
            date: '2024-01-01',
            present: 25,
            absent: 0,
            late: 2,
            attendanceRate: 100
          }
        ]
      };

      res.json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('獲取出勤統計報表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取出勤統計報表時發生錯誤'
      });
    }
  }
);

// 獲取健康統計報表
router.get('/health', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // 模擬健康統計報表資料
      const report = {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0]
        },
        summary: {
          totalRecords: 150,
          abnormalRecords: 12,
          abnormalRate: 8.0,
          averageBloodPressure: '125/78',
          averageHeartRate: 72,
          averageTemperature: 36.5
        },
        trends: [
          {
            date: '2024-01-01',
            records: 5,
            abnormal: 0,
            avgSystolic: 120,
            avgDiastolic: 75
          }
        ]
      };

      res.json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('獲取健康統計報表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取健康統計報表時發生錯誤'
      });
    }
  }
);

// 獲取活動統計報表
router.get('/activities', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // 模擬活動統計報表資料
      const report = {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0]
        },
        summary: {
          totalActivities: 45,
          completedActivities: 42,
          participationRate: 85.2,
          averageRating: 4.2
        },
        typeStats: [
          {
            type: 'physical',
            count: 15,
            participationRate: 88.5
          },
          {
            type: 'cognitive',
            count: 12,
            participationRate: 82.3
          }
        ]
      };

      res.json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('獲取活動統計報表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取活動統計報表時發生錯誤'
      });
    }
  }
);

// 獲取財務報表
router.get('/financial', 
  requireRole('admin'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // 模擬財務報表資料
      const report = {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0]
        },
        summary: {
          totalRevenue: 250000,
          totalExpenses: 180000,
          netIncome: 70000,
          elderlyCount: 25,
          averageRevenuePerElderly: 10000
        },
        revenueBreakdown: [
          {
            category: '月費',
            amount: 200000,
            percentage: 80
          },
          {
            category: '餐費',
            amount: 30000,
            percentage: 12
          }
        ],
        expenseBreakdown: [
          {
            category: '人事費用',
            amount: 120000,
            percentage: 66.7
          },
          {
            category: '食材費用',
            amount: 25000,
            percentage: 13.9
          }
        ]
      };

      res.json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('獲取財務報表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取財務報表時發生錯誤'
      });
    }
  }
);

// 匯出報表
router.post('/export', 
  requireRole('admin', 'nurse'),
  async (req, res) => {
    try {
      const { reportType, format = 'excel', startDate, endDate } = req.body;
      
      // 模擬匯出報表
      const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.json({
        success: true,
        message: '報表匯出成功',
        data: {
          fileName,
          downloadUrl: `/api/reports/download/${fileName}`
        }
      });
    } catch (error) {
      console.error('匯出報表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '匯出報表時發生錯誤'
      });
    }
  }
);

module.exports = router;

