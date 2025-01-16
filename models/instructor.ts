import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructor extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    availableHours: { day: DayOfWeek; start: string; end: string }[]; // Weekly availability
    expertise: string[]; // Swimming styles they can teach
}

export type DayOfWeek =
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';


const InstructorSchema: Schema = new Schema({
    name: { type: String, required: true },
    availableHours: [
        {
            day: {
                type: String,
                required: true,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Valid days
            },
            start: {
                type: String,
                required: true,
                validate: {
                    validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v), // HH:mm validation
                    message: 'Invalid time format for start. Expected HH:mm.',
                },
            },
            end: {
                type: String,
                required: true,
                validate: {
                    validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v), // HH:mm validation
                    message: 'Invalid time format for end. Expected HH:mm.',
                },
            },
        },
    ],
    expertise: {
        type: [String],
        required: true,
        validate: {
            validator: (v: string[]) => new Set(v).size === v.length, // Ensure unique values
            message: 'Expertise array must not contain duplicate values.',
        },
    },
});

// Enable `runValidators` for update operations, including `findByIdAndUpdate`
InstructorSchema.pre('findOneAndUpdate', function (next) {
    this.setOptions({ runValidators: true });

    const update = this.getUpdate() as Record<string, any>;

    if (update) {
        if (update.availableHours === null) {
            update.availableHours = [];
        }
        if (update.expertise === null) {
            update.expertise = [];
        }

        if (update.$set && update.$set.availableHours === null) {
            update.$set.availableHours = [];
        }
        if (update.$set && update.$set.expertise === null) {
            update.$set.expertise = [];
        }
    }

    next();
});

InstructorSchema.pre('save', function (next) {
    if (this.availableHours === null) {
        this.availableHours = [];
    }
    if (this.expertise === null) {
        this.expertise = [];
    }
    next();
});

export const Instructor = mongoose.model<IInstructor>('Instructor', InstructorSchema);
