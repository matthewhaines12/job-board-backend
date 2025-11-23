const express = require('express');
const {
  getJobs,
  getJobsCount,
  getJobsStats,
} = require('../controllers/jobsController.js');

const router = express.Router();

router.get('/', getJobs);
router.get('/count', getJobsCount);
router.get('/stats', getJobsStats);

module.exports = router;
