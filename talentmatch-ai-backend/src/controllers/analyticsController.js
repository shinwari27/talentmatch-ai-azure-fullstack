const analyticsModel = require("../models/analyticsModel");
const profileModel = require("../models/profileModel");

async function getAnalytics(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);

    const [applicationTrend, skillDistribution, experienceDistribution, hiringFunnel, matchStatistics] = await Promise.all([
      analyticsModel.getApplicationTrend(recruiterId),
      analyticsModel.getSkillDistribution(recruiterId),
      analyticsModel.getExperienceDistribution(recruiterId),
      analyticsModel.getHiringFunnel(recruiterId),
      analyticsModel.getMatchStatistics(recruiterId),
    ]);

    res.json({ applicationTrend, skillDistribution, experienceDistribution, hiringFunnel, matchStatistics });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
