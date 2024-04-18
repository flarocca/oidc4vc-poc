import mongoose from "mongoose";

export interface AuthenticationFlow extends mongoose.Document {
  type: string;
  code: string;
  state: string;
  redirectUri: string;
  nonce: string;
  status: string;
  data: object;
}

const AuthenticationFlowSchema = new mongoose.Schema<AuthenticationFlow>({
  type: {
    type: String,
    required: [true, "Provide type."],
    maxlength: [60, "Type cannot be more than 60 characters"],
  },
  code: {
    type: String,
    required: [false, "Provide code."],
    maxlength: [60, "Code cannot be more than 60 characters"],
  },
  state: {
    type: String,
    required: [false, "provide state."],
    maxlength: [60, "State cannot be more than 60 characters"],
  },
  redirectUri: {
    type: String,
    required: [false, "Provide redirecy uri."],
    maxlength: [200, "Redirect URI cannot be more than 200 characters"],
  },
  nonce: {
    type: String,
    required: [false, "Provide nonce."],
    maxlength: [60, "Nonce cannot be more than 40 characters"],
  },
  status: {
    type: String,
    required: [false, "Provide status."],
    maxlength: [60, "Status cannot be more than 60 characters"],
  },
  data: {
    type: Object,
    required: [false, "Provide data."],
  },
});

export default mongoose.models.AuthenticationFlowDocument ||
  mongoose.model<AuthenticationFlow>(
    "AuthenticationFlow",
    AuthenticationFlowSchema
  );
