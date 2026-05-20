import mongoose, { Document, Schema } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  type: 'road' | 'power' | 'safety' | 'food' | 'memory' | 'recommendation' |'must watch scenery'| (string & {});
  status: 'active' | 'resolved' | 'archived';
  visibility: 'public' | 'private';
  location: {
    type: 'Point';
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
      trim: true
    },
    status: { 
      type: String, 
      enum: ['active', 'resolved', 'archived'], 
      default: 'active' 
    },
    visibility: { 
      type: String, 
      enum: ['public', 'private'], 
      default: 'public' 
    },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, 
    },
    reportedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  { timestamps: true }
);

// Create a geospatial index for efficient map querying
incidentSchema.index({ location: '2dsphere' });

export default mongoose.model<IIncident>('Incident', incidentSchema);