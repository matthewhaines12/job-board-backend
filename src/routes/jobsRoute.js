const express = require('express');
const {
  getJobs,
  getJobsCount,
  getJobsStats,
  fetchJobs,
} = require('../controllers/jobsController.js');

const router = express.Router();

router.get('/', getJobs);
router.get('/count', getJobsCount);
router.get('/stats', getJobsStats);
router.post('/fetch', fetchJobs);

module.exports = router;
