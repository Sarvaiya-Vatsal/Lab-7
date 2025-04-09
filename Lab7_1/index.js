const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(express.json());


const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};


const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true, 
        lowercase: true, 
        match: [/^[a-z]+$/, 'Name must be in lowercase letters'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true, 
        lowercase: true, 
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] 
    },
    age: { 
        type: Number, 
        required: [true, 'Age is required'],
        min: [0, 'Age cannot be negative'], 
        max: [120, 'Age seems invalid']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});



const User = mongoose.model('User', userSchema);


const insertUser = async (userData) => {
    try {
        const user = new User(userData);
        const savedUser = await user.save();
        console.log('User saved:', savedUser);
        return savedUser;
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};


const fetchUsers = async () => {
    try {
        const users = await User.find();
        console.log('All users:', users);
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};


const findUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        console.log('User found:', user);
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
};

const updateUser = async (email, updateData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            updateData,
            { new: true, runValidators: true }
        );
        console.log('User updated:', updatedUser);
        return updatedUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

const deleteUser = async (email) => {
    try {
        const deletedUser = await User.findOneAndDelete({ email: email });
        console.log('User deleted:', deletedUser);
        return deletedUser;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Main function to demonstrate all operations
const main = async () => {
    try {
        await connectDB();

        // Generate a random email to avoid duplicate key errors
        const randomEmail = `vatsal${Math.floor(Math.random() * 10000)}@gmail.com`;
        
        const newUser = await insertUser({ 
            name: 'vatsal', 
            email: randomEmail, 
            age: 18 
        });

        await findUserByEmail(randomEmail);

        await updateUser(randomEmail, { 
            age: 19,
            name: 'vatsalupdated'
        });

        await fetchUsers();

        await deleteUser(randomEmail);

        await fetchUsers();

    } catch (error) {
        console.error('Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

main();