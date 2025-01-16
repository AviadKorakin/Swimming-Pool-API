import mongoose from 'mongoose';



// Connect to MongoDB Atlas and clear the database
export const connectDBAtlas = async (): Promise<void> => {
    try {
        const mongoAtlasURI: string | undefined = process.env.MONGO_ATLAS_URI;

        if (!mongoAtlasURI) {
            console.error('Error setting up MongoDB Atlas:' +
                'MONGO_ATLAS_URI is not defined in the environment variables');
            process.exit(1); // Exit on failure
        }
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoAtlasURI);
        console.log('MongoDB Atlas connected successfully');

        console.log('Clearing the database...');
        await clearDatabase();
        console.log('Database cleared successfully');
    } catch (err: any) {
        console.error('Error setting up MongoDB Atlas:', err.message);
        process.exit(1); // Exit on failure
    }
};

// Clear the database by dropping all collections
const clearDatabase = async (): Promise<void> => {
    const db = mongoose.connection.db;

    if (!db) {
        console.error('Error: No database connection established. Ensure MongoDB is connected before clearing the database.');
        return;
    }

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
        console.log(`Dropping collection: ${collection.name}`);
        await db.collection(collection.name).drop();
    }
};
// Close MongoDB Atlas connection
export const closeDBAtlasConnection = async (): Promise<void> => {
    try {
        console.log('Closing MongoDB Atlas connection...');
        await mongoose.connection.close();
        console.log('MongoDB Atlas connection closed');
    } catch (err: any) {
        console.error('Error closing MongoDB Atlas connection:', err.message);
    }
};
