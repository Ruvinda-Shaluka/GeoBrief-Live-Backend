import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Group from './models/Group.js';
import Incident from './models/Incident.js';

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected. Cleaning up old data...");

    // Delete existing records to start clean
    await Incident.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});

    console.log("Creating users...");
    // Passwords will be automatically hashed by pre-save hook in User model
    const alice = await User.create({
      name: "Alice Smith",
      email: "alice@example.com",
      passwordHash: "1234567890",
      role: "admin",
      authProvider: "local"
    });

    const bob = await User.create({
      name: "Bob Johnson",
      email: "bob@example.com",
      passwordHash: "1234567890",
      role: "user",
      authProvider: "local"
    });

    const charlie = await User.create({
      name: "Charlie Brown",
      email: "charlie@example.com",
      passwordHash: "1234567890",
      role: "user",
      authProvider: "local"
    });

    console.log(`Created users: ${alice.name}, ${bob.name}, ${charlie.name}`);

    console.log("Creating groups...");
    // Group admins are automatically added to members in the save hook
    const colomboWatch = await Group.create({
      name: "Colombo City Watch",
      description: "Keeping our Colombo streets safe and sound.",
      admin: alice._id,
      members: [alice._id, bob._id]
    });

    const powerVolunteers = await Group.create({
      name: "Power Grid Volunteers",
      description: "Monitoring electrical outages and helping out.",
      admin: bob._id,
      members: [bob._id, charlie._id]
    });

    console.log(`Created groups: ${colomboWatch.name}, ${powerVolunteers.name}`);

    console.log("Creating incidents...");
    // Coordinates: [longitude, latitude]

    // ==================== 1. Public Incidents ====================
    // Category: road
    const publicIncident1 = await Incident.create({
      title: "Massive Pothole on Galle Road",
      description: "Large pothole in the middle lane near Bambalapitiya junction. Causes severe traffic slow down.",
      type: "road",
      status: "active",
      visibility: "public",
      location: {
        type: "Point",
        coordinates: [79.8584, 6.8966]
      },
      reportedBy: alice._id,
      upvotes: [bob._id]
    });

    // Category: power
    const publicIncident2 = await Incident.create({
      title: "Transformer explosion near Town Hall",
      description: "Severe spark and blast noise from transformer. Power outage reported in surrounding blocks.",
      type: "power",
      status: "active",
      visibility: "public",
      location: {
        type: "Point",
        coordinates: [79.8631, 6.9189]
      },
      reportedBy: bob._id,
      upvotes: [charlie._id, alice._id]
    });

    // Category: food
    const publicIncident3 = await Incident.create({
      title: "Community Kitchen Food Drive",
      description: "Weekly food distribution drive. All volunteers welcome to support packaging.",
      type: "food",
      status: "active",
      visibility: "public",
      location: {
        type: "Point",
        coordinates: [79.8722, 6.9311]
      },
      reportedBy: charlie._id,
      upvotes: []
    });

    // Category: safety
    const publicIncident4 = await Incident.create({
      title: "Waterlogging and Flooding on Main St",
      description: "Heavy rains have caused waterlogging on Main St. Vehicles advised to drive slow.",
      type: "safety",
      status: "active",
      visibility: "public",
      location: {
        type: "Point",
        coordinates: [79.8512, 6.9421]
      },
      reportedBy: alice._id,
      upvotes: [bob._id]
    });

    // Category: other
    const publicIncident5 = await Incident.create({
      title: "Blocked storm drain near Central Park",
      description: "Storm drain blocked with plastic trash. Water accumulation spreading on the sidewalk.",
      type: "other",
      status: "active",
      visibility: "public",
      location: {
        type: "Point",
        coordinates: [79.8688, 6.9234]
      },
      reportedBy: bob._id,
      upvotes: []
    });

    console.log("Creating 30+ extra public incidents across all categories...");
    const extraIncidentData = [];
    const categories = ["road", "power", "food", "safety", "other"];
    const reporters = [alice._id, bob._id, charlie._id];
    
    for (let i = 1; i <= 32; i++) {
      const category = categories[i % categories.length];
      const reporter = reporters[i % reporters.length];
      extraIncidentData.push({
        title: `Extra Public Incident #${i} (${category.toUpperCase()})`,
        description: `This is automated test report #${i} for the public feed, checking pagination limits. Category: ${category}.`,
        type: category,
        status: "active",
        visibility: "public",
        location: {
          type: "Point",
          coordinates: [79.8500 + (i * 0.0015), 6.9000 + (i * 0.0012)]
        },
        reportedBy: reporter,
        upvotes: i % 3 === 0 ? [alice._id, bob._id] : i % 3 === 1 ? [charlie._id] : []
      });
    }
    
    await Incident.insertMany(extraIncidentData);

    // ==================== 2. Private Incidents ====================
    // Category: safety
    const privateIncident1 = await Incident.create({
      title: "Suspicious activity near my garage",
      description: "Observed someone lingering near the garage lock at 2 AM. Reported for personal log security tracking.",
      type: "safety",
      status: "active",
      visibility: "private",
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      reportedBy: bob._id,
      upvotes: []
    });

    // Category: other
    const privateIncident2 = await Incident.create({
      title: "Lost key bundle near park",
      description: "Lost a silver key ring with 3 keys. Keeping this for my own reference.",
      type: "other",
      status: "active",
      visibility: "private",
      location: {
        type: "Point",
        coordinates: [79.8688, 6.9012]
      },
      reportedBy: alice._id,
      upvotes: []
    });

    // Category: road
    const privateIncident3 = await Incident.create({
      title: "Personal trip delayed due to road closure",
      description: "Commute delayed by 45 minutes because of temporary road blocks. Logged for personal transit diary.",
      type: "road",
      status: "active",
      visibility: "private",
      location: {
        type: "Point",
        coordinates: [79.8755, 6.9155]
      },
      reportedBy: charlie._id,
      upvotes: []
    });

    // Category: power
    const privateIncident4 = await Incident.create({
      title: "Solar inverter system self-check",
      description: "Completed annual checks on my home solar inverter system. Working fine.",
      type: "power",
      status: "active",
      visibility: "private",
      location: {
        type: "Point",
        coordinates: [79.8644, 6.9299]
      },
      reportedBy: bob._id,
      upvotes: []
    });

    // Category: food
    const privateIncident5 = await Incident.create({
      title: "Emergency pantry supplies check",
      description: "Checked emergency food rations. Rotated canned goods. Logged to keep track.",
      type: "food",
      status: "active",
      visibility: "private",
      location: {
        type: "Point",
        coordinates: [79.8590, 6.8910]
      },
      reportedBy: alice._id,
      upvotes: []
    });

    // ==================== 3. Group Incidents ====================
    // Category: safety (Colombo City Watch)
    const groupIncident1 = await Incident.create({
      title: "Aggressive street dogs pack",
      description: "Pack of 5-6 aggressive street dogs barking at cyclists. Sharing with Colombo Watch to alert members.",
      type: "safety",
      status: "active",
      visibility: "group",
      sharedWithGroups: [colomboWatch._id],
      location: {
        type: "Point",
        coordinates: [79.8552, 6.9125]
      },
      reportedBy: bob._id,
      upvotes: [alice._id]
    });

    // Category: power (Power Grid Volunteers)
    const groupIncident2 = await Incident.create({
      title: "Street light failure on Baseline Rd",
      description: "Entire line of street lights are out. Very dark and dangerous road conditions.",
      type: "power",
      status: "active",
      visibility: "group",
      sharedWithGroups: [powerVolunteers._id],
      location: {
        type: "Point",
        coordinates: [79.8788, 6.9255]
      },
      reportedBy: charlie._id,
      upvotes: []
    });

    // Category: road (Colombo City Watch)
    const groupIncident3 = await Incident.create({
      title: "Traffic light dysfunction warning",
      description: "Traffic lights at main junction flashing yellow constantly. Drive safe and yield.",
      type: "road",
      status: "active",
      visibility: "group",
      sharedWithGroups: [colomboWatch._id],
      location: {
        type: "Point",
        coordinates: [79.8601, 6.9050]
      },
      reportedBy: alice._id,
      upvotes: []
    });

    // Category: food (Power Grid Volunteers)
    const groupIncident4 = await Incident.create({
      title: "Group soup kitchen cleanup volunteer prep",
      description: "Volunteer meal cleanup prep at town hall. Food and cleaning supplies checklist shared.",
      type: "food",
      status: "active",
      visibility: "group",
      sharedWithGroups: [powerVolunteers._id],
      location: {
        type: "Point",
        coordinates: [79.8790, 6.9320]
      },
      reportedBy: bob._id,
      upvotes: []
    });

    // Category: other (Colombo City Watch)
    const groupIncident5 = await Incident.create({
      title: "Public garbage pile up warning",
      description: "A large pile of garbage bags is accumulating near the walkway. Reported for watch committee attention.",
      type: "other",
      status: "active",
      visibility: "group",
      sharedWithGroups: [colomboWatch._id],
      location: {
        type: "Point",
        coordinates: [79.8520, 6.9180]
      },
      reportedBy: alice._id,
      upvotes: []
    });

    console.log("Seeded database successfully with users, groups, and incidents in all categories!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
