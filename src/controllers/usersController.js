const User = require('../models/User.js');

// GET /api/users/saved-jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const userID = req.userID;
    const user = await User.findById(userID).populate('savedJobs');
    if (!user) return res.status(404).json({ error: "User doesn't exist" });
    res.status(200).json({ savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/users/save-job
exports.saveJob = async (req, res) => {
  try {
    const { jobID } = req.body;
    const userID = req.userID;

    const user = await User.findByIdAndUpdate(
      userID,
      { $addToSet: { savedJobs: jobID } },
      { new: true }
    );

    if (!user) return res.status(401).json({ error: "User doesn't exist" });
    res
      .status(200)
      .json({ message: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/users/saved-jobs/:jobID
exports.removeSavedJob = async (req, res) => {
  try {
    const { jobID } = req.params;
    const userID = req.userID;

    const user = await User.findByIdAndUpdate(
      userID,
      { $pull: { savedJobs: jobID } },
      { new: true }
    );

    if (!user) return res.status(401).json({ error: "User doesn't exist" });
    res
      .status(200)
      .json({ message: 'Job removed successfully', savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
