import mongoose, { Document, Schema } from "mongoose";

export interface IIncident extends Document {
  title: string;
  description: string;
  type:
    | "road"
    | "power"
    | "safety"
    | "food"
    | "memory"
    | "recommendation"
    | (string & {});
  status: "active" | "resolved" | "archived";
  visibility: "public" | "private" | "group";
  sharedWithGroups: mongoose.Types.ObjectId[];
  upvotes: mongoose.Types.ObjectId[];
  location: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
  reportedBy: mongoose.Types.ObjectId;
}

const incidentSchema = new Schema<IIncident>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "archived"],
      default: "active",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "group"],
      default: "public",
    },
    sharedWithGroups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// --- NEW VALIDATION HOOK ---
incidentSchema.pre("validate", function (next) {
  // 1. If visibility is 'group', ensure at least one group is provided
  if (
    this.visibility === "group" &&
    (!this.sharedWithGroups || this.sharedWithGroups.length === 0)
  ) {
    this.invalidate(
      "sharedWithGroups",
      "At least one group must be specified when visibility is set to group.",
    );
  }

  // 2. If visibility is NOT 'group', force the array to be empty to prevent dirty data
  if (this.visibility !== "group") {
    this.sharedWithGroups = [];
  }
});

// Create a geospatial index for efficient map querying
incidentSchema.index({ location: "2dsphere" });

export default mongoose.model<IIncident>("Incident", incidentSchema);
