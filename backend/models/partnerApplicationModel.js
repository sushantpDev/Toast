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
    redirectUri: {
      type: String,
      required: [true, 'Please add a redirectUri'],
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
