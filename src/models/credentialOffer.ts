import mongoose, { Schema } from "mongoose";

export interface CredentialOffer extends mongoose.Document {
  code: string;
  status: string;
  type: string;
  data: object;
}

const CredentialOfferDocumentSchema = new mongoose.Schema<CredentialOffer>({
  code: {
    type: String,
    required: [true, "Provide code."],
    maxlength: [60, "Code cannot be more than 60 characters"],
  },
  status: {
    type: String,
    required: [false, "Provide status."],
    maxlength: [60, "Status cannot be more than 60 characters"],
  },
  type: {
    type: String,
    required: [true, "Provide type."],
    maxlength: [60, "Type cannot be more than 60 characters"],
  },
  data: {
    type: Object,
    required: [true, "Provide data."],
  },
});

export default mongoose.models.CredentialOfferDocument ||
  mongoose.model<CredentialOffer>(
    "CredentialOfferDocument",
    CredentialOfferDocumentSchema
  );
