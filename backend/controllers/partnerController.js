import PartnerApplication from '../models/partnerApplicationModel.js';

// @desc    Register new partner application
// @route   POST /api/partners/register
// @access  Public
export const registerPartner = async (req, res, next) => {
  try {
    const { name, clientId, clientSecret, redirectUri, allowedRedirectUris, isActive } = req.body;

    // Validate required fields — accept either a single redirectUri or an array
    if (!name || !clientId || !clientSecret || (!redirectUri && !allowedRedirectUris?.length)) {
      res.status(400);
      throw new Error('Please add all required fields: name, clientId, clientSecret, and at least one redirectUri');
    }

    // Check if partner application already exists
    const partnerExists = await PartnerApplication.findOne({ clientId });

    if (partnerExists) {
      res.status(400);
      throw new Error('Partner application with this clientId already exists');
    }

    // Normalise: if only a legacy single redirectUri was provided, also populate allowedRedirectUris
    const urisArray = allowedRedirectUris?.length
      ? allowedRedirectUris
      : redirectUri ? [redirectUri] : [];

    // Create partner application
    const partnerApp = await PartnerApplication.create({
      name,
      clientId,
      clientSecret,
      redirectUri: redirectUri || urisArray[0],
      allowedRedirectUris: urisArray,
      isActive: isActive !== undefined ? isActive : true,
    });

    if (partnerApp) {
      res.status(201).json({
        _id: partnerApp._id,
        name: partnerApp.name,
        clientId: partnerApp.clientId,
        clientSecret: partnerApp.clientSecret,
        redirectUri: partnerApp.redirectUri,
        allowedRedirectUris: partnerApp.allowedRedirectUris,
        isActive: partnerApp.isActive,
        createdAt: partnerApp.createdAt,
      });
    } else {
      res.status(400);
      throw new Error('Invalid partner application data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all partner applications
// @route   GET /api/partners
// @access  Public
export const getPartners = async (req, res, next) => {
  try {
    const partners = await PartnerApplication.find({});
    res.json(partners);
  } catch (error) {
    next(error);
  }
};

// @desc    Get partner by clientId
// @route   GET /api/partners/:clientId
// @access  Public
export const getPartnerByClientId = async (req, res, next) => {
  try {
    const partner = await PartnerApplication.findOne({ clientId: req.params.clientId });

    if (partner) {
      res.json({
        _id: partner._id,
        name: partner.name,
        clientId: partner.clientId,
        clientSecret: partner.clientSecret,
        redirectUri: partner.redirectUri,
        allowedRedirectUris: partner.allowedRedirectUris,
        isActive: partner.isActive,
        createdAt: partner.createdAt,
      });
    } else {
      res.status(404);
      throw new Error('Partner application not found');
    }
  } catch (error) {
    next(error);
  }
};
