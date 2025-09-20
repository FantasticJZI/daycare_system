const express = require('express');
const router = express.Router();
const elderlyController = require('../controllers/elderlyController');
const { authenticateToken, requireRole, requireFamilyAccess } = require('../middleware/auth');
const { validateElderly, validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取長者統計資料（管理員、護理師）
router.get('/stats', 
  requireRole('admin', 'nurse'), 
  elderlyController.getElderlyStats
);

// 獲取所有長者列表
router.get('/', 
  validatePagination,
  elderlyController.getAllElderly
);

// 獲取單一長者資料
router.get('/:id', 
  validateMongoId('id'),
  elderlyController.getElderlyById
);

// 建立新長者（管理員、護理師）
router.post('/', 
  requireRole('admin', 'nurse'),
  validateElderly,
  elderlyController.createElderly
);

// 更新長者資料
router.put('/:id', 
  validateMongoId('id'),
  elderlyController.updateElderly
);

// 刪除長者（軟刪除）
router.delete('/:id', 
  requireRole('admin', 'nurse'),
  validateMongoId('id'),
  elderlyController.deleteElderly
);

// 家屬管理
router.post('/:elderlyId/family', 
  requireRole('admin', 'nurse'),
  validateMongoId('elderlyId'),
  elderlyController.addFamilyMember
);

router.delete('/:elderlyId/family/:memberId', 
  requireRole('admin', 'nurse'),
  validateMongoId('elderlyId'),
  validateMongoId('memberId'),
  elderlyController.removeFamilyMember
);

// 更新長照評估
router.put('/:id/care-assessment', 
  requireRole('admin', 'nurse'),
  validateMongoId('id'),
  elderlyController.updateCareAssessment
);

module.exports = router;

