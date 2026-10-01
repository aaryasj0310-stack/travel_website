const service = require('../services/journey.service');
const { sendSuccess } = require('../utils/api-response');
const getDashboard = async (req, res) => sendSuccess(res, { data: await service.overview(req.session.userId, req.query.tripId) });
module.exports = { getDashboard };
