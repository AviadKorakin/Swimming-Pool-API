import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    preferredStyles: string[]; // ['freestyle', 'breaststroke', 'butterfly', 'backstroke']
    lessonPreference: 'private' | 'group' | 'both_prefer_private' | 'both_prefer_group'; // Lesson type preference
}

const StudentSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    preferredStyles: {
        type: [String],
        required: true,
        validate: {
            validator: function (value: string[]) {
                return Array.isArray(value) && new Set(value).size === value.length;
            },
            message: 'preferredStyles must have unique values',
        },
    },
    lessonPreference: {
        type: String,
        enum: ['private', 'group', 'both_prefer_private', 'both_prefer_group'],
        required: true,
    },
});
StudentSchema.pre('findOneAndUpdate', function (next) {
    this.setOptions({ runValidators: true });

    const update = this.getUpdate() as Record<string, any>;

    if (update) {
        if (update.preferredStyles === null) {
            update.preferredStyles = [];
        }

        if (update.$set && update.$set.preferredStyles === null) {
            update.$set.preferredStyles = [];
        }
    }

    next();
});

StudentSchema.pre('save', function (next) {
    if (this.preferredStyles === null) {
        this.preferredStyles = [];
    }
    next();
});



export type StudentFilter = Partial<Pick<IStudent, 'firstName' | 'lastName' | 'preferredStyles' | 'lessonPreference'>>;
export const Student = mongoose.model<IStudent>('Student', StudentSchema);
