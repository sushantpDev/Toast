import mongoose from 'mongoose';

const partnerApplicationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    clientId: {
      type: String,
      required: [true, 'Please add a clientId'],
      unique: true,
    },
    clientSecret: {
      type: String,
      required: [true, 'Please add a clientSecret'],
    },
    // Legacy single-URI field (kept for DB compatibility)
    redirectUri: {
      type: String,
      default: null,
    },
    // Production-ready: multiple allowed redirect URIs (dev + production)
    allowedRedirectUris: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PartnerApplication = mongoose.model('PartnerApplication', partnerApplicationSchema);

export default PartnerApplication;
