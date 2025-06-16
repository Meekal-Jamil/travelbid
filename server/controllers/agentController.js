const User = require('../models/User');

// Get agent statistics
exports.getAgentStats = async (req, res) => {
  try {
    const agent = await User.findById(req.user._id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Return the stats object, defaulting to 0 if not set
    res.json({
      totalBids: agent.stats?.totalBids || 0,
      acceptedBids: agent.stats?.acceptedBids || 0,
      rejectedBids: agent.stats?.rejectedBids || 0,
      pendingBids: agent.stats?.pendingBids || 0,
      earnings: agent.stats?.totalEarnings || 0
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ message: 'Failed to fetch agent statistics' });
  }
}; 