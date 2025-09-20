const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { authenticateToken, requireRole, requireFamilyAccess } = require('../middleware/auth');
const { validateHealthRecord, validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取異常健康記錄（管理員、護理師）
router.get('/abnormal', 
  requireRole('admin', 'nurse'),
  validatePagination,
  healthController.getAbnormalHealthRecords
);

// 獲取長者的健康記錄
router.get('/elderly/:elderlyId', 
  validateMongoId('elderlyId'),
  requireFamilyAccess,
  validatePagination,
  healthController.getHealthRecords
);

// 獲取健康統計資料
router.get('/elderly/:elderlyId/stats', 
  validateMongoId('elderlyId'),
  requireFamilyAccess,
  healthController.getHealthStats
);

// 獲取單一健康記錄
router.get('/:id', 
  validateMongoId('id'),
  healthController.getHealthRecordById
);

// 建立健康記錄
router.post('/', 
  requireRole('admin', 'nurse', 'caregiver'),
  validateHealthRecord,
  healthController.createHealthRecord
);

// 更新健康記錄
router.put('/:id', 
  validateMongoId('id'),
  healthController.updateHealthRecord
);

// 刪除健康記錄（管理員、護理師）
router.delete('/:id', 
  requireRole('admin', 'nurse'),
  validateMongoId('id'),
  healthController.deleteHealthRecord
);

// 審核健康記錄（護理師、醫師）
router.put('/:id/review', 
  requireRole('nurse', 'doctor'),
  validateMongoId('id'),
  healthController.reviewHealthRecord
);

module.exports = router;

