import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: string; // _id will be received from Clerk
    role: 'student' | 'instructor' | 'admin';
    instructor: mongoose.Types.ObjectId | null;
    student: mongoose.Types.ObjectId | null;
}

const UserSchema: Schema = new Schema({
    _id: {
        type: String, // Clerk will provide the _id
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        required: true,
    },
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', default: null },
    student: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
});

export const User = mongoose.model<IUser>('User', UserSchema);
