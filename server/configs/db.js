import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on('connected',()=>console.log('✓ Database Connected'));
        mongoose.connection.on('error',(error)=>console.log('✗ Database Connection Error:',error.message));
        mongoose.connection.on('disconnected',()=>console.log('✗ Database Disconnected'));
        
        await mongoose.connect(`${process.env.MONGODB_URI}/QuickGPT`, {
            connectTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 20000,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✓ MongoDB Connection String Validated');
        return true;
    }
    catch(error)
    {
        console.error('✗ Failed to connect to MongoDB:');
        console.error('  Error:', error.message);
        console.error('  Connection String:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
        throw error;
    }
}

export default connectDB;