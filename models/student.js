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
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StudentSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    preferredStyles: {
        type: [String],
        required: true,
        validate: {
            validator: function (value) {
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
    const update = this.getUpdate();
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
exports.Student = mongoose_1.default.model('Student', StudentSchema);
