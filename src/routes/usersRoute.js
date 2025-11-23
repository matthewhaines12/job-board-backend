const express = require('express');
const {
  getSavedJobs,
  saveJob,
  removeSavedJob,
} = require('../controllers/usersController.js');
const verifyAccessToken = require('../middleware/verifyAccessToken.js');

const router = express.Router();

router.use(verifyAccessToken);

router.get('/saved-jobs', getSavedJobs);
router.post('/save-job', saveJob);
router.delete('/saved-jobs/:jobID', removeSavedJob);

module.exports = router;
