import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
    instructor: mongoose.Types.ObjectId; // Reference to Instructor
    students: mongoose.Types.ObjectId[]; // List of Student IDs
    style: string; // Swimming style
    type: 'private' | 'group'; // Lesson type
    startTime: Date; // Lesson start time
    endTime: Date; // Lesson end time
    editable?: boolean; // Lesson is editable
    deletable?: boolean; // Lesson is deletable
    assignable?: boolean;// Lesson is assignable
    cancelable?: boolean;// Lesson is cancelable
}
export interface ILessonWithFlags extends Omit<ILesson, keyof mongoose.Document> {
    editable: boolean;
    deletable: boolean;

}

export interface ILessonWithStudentFlags extends Omit<ILesson, keyof mongoose.Document> {
    assignable: boolean;
    cancelable: boolean;
}
// WeeklyLessonData Interface
export interface WeeklyLessonData {
    Sunday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
    Monday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
    Tuesday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
    Wednesday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
    Thursday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
    Friday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
    Saturday: { date: Date; editable: boolean; lessons: ILessonWithFlags[] };
}

// WeeklyLessonData Interface
export interface WeeklyStudentLessonData {
    Sunday: { date: Date; lessons: ILessonWithStudentFlags[] };
    Monday: { date: Date; lessons: ILessonWithStudentFlags[] };
    Tuesday: { date: Date; lessons: ILessonWithStudentFlags[] };
    Wednesday: { date: Date; lessons: ILessonWithStudentFlags[] };
    Thursday: { date: Date; lessons: ILessonWithStudentFlags[] };
    Friday: { date: Date;  lessons: ILessonWithStudentFlags[] };
    Saturday: { date: Date; lessons: ILessonWithStudentFlags[] };
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
