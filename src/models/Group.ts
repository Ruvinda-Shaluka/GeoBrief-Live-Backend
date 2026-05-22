import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

const groupSchema = new Schema<IGroup>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    admin: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    members: [
      { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
      }
    ]
  },
  { timestamps: true }
);

// --- NEW RELATIONSHIP HOOK ---
groupSchema.pre('save', function (next) {
  // Guarantee the admin is always included in the members array
  if (this.admin && !this.members.includes(this.admin)) {
    this.members.push(this.admin);
  }
});

export default mongoose.model<IGroup>('Group', groupSchema);