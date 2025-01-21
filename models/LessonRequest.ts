import mongoose, { Schema, Document } from "mongoose";

export interface ILessonRequest extends Document {
    instructor: mongoose.Types.ObjectId; // Reference to Instructor
    students: mongoose.Types.ObjectId[]; // List of student IDs
    style: string; // Swimming style
    type: "private" | "group"; // Lesson type
    startTime: Date; // Lesson start time
    endTime: Date; // Lesson end time
    status: "pending" | "approved" | "rejected"; // Request status
    createdAt: Date; // Request creation timestamp
    canApprove?: boolean;
}
export interface ILessonRequestWithFlags extends Omit<ILessonRequest, keyof mongoose.Document> {
    canApprove: boolean; // Indicates if the lesson request can be approved
}

const LessonRequestSchema: Schema = new Schema(
    {
        instructor: { type: Schema.Types.ObjectId, ref: "Instructor", required: true },
        students: [{ type: Schema.Types.ObjectId, ref: "Student", required: true }],
        style: { type: String, required: true },
        type: {
            type: String,
            enum: ["private", "group"],
            required: true
        },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
    },
    { timestamps: true } // Automatically manages createdAt and updatedAt fields
);
export type RequestLessonFilter = Partial<
    Pick<ILessonRequest, "instructor" | "students" | "style" | "type" | "status" | "startTime" | "endTime">
>;

export const LessonRequest = mongoose.model<ILessonRequest>(
    "LessonRequest",
    LessonRequestSchema
);