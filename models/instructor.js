"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instructor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InstructorSchema = new mongoose_1.Schema({
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
                    validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v), // HH:mm validation
                    message: 'Invalid time format for start. Expected HH:mm.',
                },
            },
            end: {
                type: String,
                required: true,
                validate: {
                    validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v), // HH:mm validation
                    message: 'Invalid time format for end. Expected HH:mm.',
                },
            },
        },
    ],
    expertise: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => new Set(v).size === v.length, // Ensure unique values
            message: 'Expertise array must not contain duplicate values.',
        },
    },
});
// Enable `runValidators` for update operations, including `findByIdAndUpdate`
InstructorSchema.pre('findOneAndUpdate', function (next) {
    this.setOptions({ runValidators: true });
    const update = this.getUpdate();
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
exports.Instructor = mongoose_1.default.model('Instructor', InstructorSchema);
