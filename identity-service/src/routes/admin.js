const express = require('express');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users (for development only)
router.get('/users', async (req, res) => {
  try {
    logger.info('Admin endpoint: Getting all users');
    
    const users = await User.find({}, {
      username: 1,
      email: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const totalTokens = await RefreshToken.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        stats: {
          totalUsers,
          totalActiveTokens: totalTokens,
          latestRegistration: users[0]?.createdAt || null
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    logger.info('Admin endpoint: Getting database stats');
    
    const totalUsers = await User.countDocuments();
    const totalTokens = await RefreshToken.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalActiveTokens: totalTokens,
        newUsersToday: recentUsers,
        databaseName: 'social_media',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Clear all users (DANGEROUS - development only)
router.delete('/users/clear', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'This operation is not allowed in production'
      });
    }

    logger.warn('Admin endpoint: Clearing all users and tokens');
    
    const deletedUsers = await User.deleteMany({});
    const deletedTokens = await RefreshToken.deleteMany({});

    res.json({
      success: true,
      message: 'All users and tokens cleared',
      data: {
        deletedUsers: deletedUsers.deletedCount,
        deletedTokens: deletedTokens.deletedCount
      }
    });
  } catch (error) {
    logger.error('Error clearing users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;