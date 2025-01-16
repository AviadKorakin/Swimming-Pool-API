import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
    instructor: mongoose.Types.ObjectId; // Reference to Instructor
    students: mongoose.Types.ObjectId[]; // List of Student IDs
    style: string; // Swimming style
    type: 'private' | 'group'; // Lesson type
    startTime: Date; // Lesson start time
    endTime: Date; // Lesson end time
}

const LessonSchema: Schema = new Schema({
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
    students: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
        required: false, // Field is optional
        default: [], // Default value ensures the field is initialized as an empty array if undefined
    },
    style: { type: String, required: true },
    type: {
        type: String,
        enum: ['private', 'group'],
        required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
});




LessonSchema.pre('findOneAndUpdate', function (next) {
    this.setOptions({ runValidators: true });

    const update = this.getUpdate() as Record<string, any>;

    if (update) {
        if (update.students === null) {
            update.students = [];
        }

        if (update.$set && update.$set.students === null) {
            update.$set.students = [];
        }
    }

    next();
});

LessonSchema.pre('save', function (next) {
    if (this.students === null) {
        this.students = [];
    }
    next();
});




export type LessonFilter = Partial<
    Pick<ILesson, 'style' | 'type' | 'startTime' | 'endTime'>
>;

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
