// @ts-ignore
import swaggerJsdoc from 'swagger-jsdoc';
// @ts-ignore
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Swimming Scheduler API',
            version: '1.0.0',
            description: 'API documentation for managing swimming lessons',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                WeeklyStudentLessonData: {
                    type: "object",
                    properties: {
                        Sunday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                        Monday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                        Tuesday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                        Wednesday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                        Thursday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                        Friday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                        Saturday: { $ref: "#/components/schemas/DayLessonDataWithStudentFlags" },
                    },
                },
                DayLessonDataWithStudentFlags: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            format: "date-time",
                            description: "The specific date for the lessons."
                        },
                        lessons: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/LessonWithStudentFlags"
                            }
                        }
                    },
                },
                LessonWithStudentFlags: {
                    type: "object",
                    properties: {
                        instructor: {type: "string", description: "The ID of the instructor."},
                        students: {
                            type: "array",
                            items: {type: "string"},
                            description: "List of student IDs assigned to the lesson."
                        },
                        style: {type: "string", description: "Swimming style of the lesson."},
                        type: {
                            type: "string",
                            enum: ["private", "group"],
                            description: "Lesson type (private or group)."
                        },
                        startTime: {
                            type: "string",
                            format: "date-time",
                            description: "Start time of the lesson."
                        },
                        endTime: {
                            type: "string",
                            format: "date-time",
                            description: "End time of the lesson."
                        },
                        assignable: {
                            type: "boolean",
                            description: "Indicates whether the student can be assigned to this lesson."
                        },
                        cancelable: {
                            type: "boolean",
                            description: "Indicates whether the student can be assigned to this lesson."
                        }
                    },
                },
                // User schemas
                UserRequest: {
                    type: "object",
                    properties: {
                        userId: { type: "string", description: "Clerk-provided User ID" },
                        role: { type: "string", enum: ["student", "instructor", "admin"], description: "User role" },
                    },
                    required: ["userId", "role"]
                },
                UserResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "User ID" },
                        role: { type: "string", enum: ["student", "instructor", "admin"], description: "User role" },
                    },
                },
                // Student schemas
                StudentRequest: {
                    type: 'object',
                    properties: {
                        firstName: {type: 'string'},
                        lastName: {type: 'string'},
                        preferredStyles: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        lessonPreference: {
                            type: 'string',
                            enum: ['private', 'group', 'both_prefer_private', 'both_prefer_group'],
                        },
                    },
                },
                StudentResponse: {
                    type: 'object',
                    properties: {
                        _id: {type: 'string'},
                        firstName: {type: 'string'},
                        lastName: {type: 'string'},
                        preferredStyles: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        lessonPreference: {
                            type: 'string',
                            enum: ['private', 'group', 'both_prefer_private', 'both_prefer_group'],
                        },
                    },
                },
                // Instructor schemas
                InstructorRequest: {
                    type: "object",
                    properties: {
                        name: {"type": "string"},
                        availableHours: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    day: {
                                        type: "string",
                                        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                                    },
                                    start: {"type": "string", "example": "09:00"},
                                    end: {"type": "string", "example": "17:00"}
                                },
                                required: ["day", "start", "end"]
                            }
                        },
                        expertise: {
                            type: "array",
                            items: {"type": "string"},
                            description: "Swimming styles the instructor can teach"
                        }
                    },
                    required: ["name", "availableHours", "expertise"]
                },

                InstructorResponse: {
                    type: "object",
                    properties: {
                        id: {type: "string"},
                        name: {type: "string"},
                        availableHours: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    day: {
                                        type: "string",
                                        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                                    },
                                    start: {type: "string", example: "09:00"},
                                    end: {type: "string", example: "17:00"}
                                }
                            }
                        },
                        expertise: {
                            type: "array",
                            items: {type: "string"},
                            description: "Swimming styles the instructor can teach"
                        }
                    },
                },
                //LessonSchema
                LessonRequest: {
                    type: "object",
                    properties: {
                        instructor: {type: "string", description: "Instructor ID"},
                        students: {
                            type: "array",
                            items: {type: "string"},
                            description: "List of Student IDs"
                        },
                        style: {type: "string", description: "Swimming style"},
                        type: {
                            type: "string",
                            enum: ["private", "group"],
                            description: "Lesson type"
                        },
                        startTime: {type: "string", format: "date-time", description: "Lesson start time"},
                        endTime: {type: "string", format: "date-time", description: "Lesson end time"}
                    },
                    required: ["instructor", "style", "type", "startTime", "endTime"]
                },
                LessonResponse: {
                    type: "object",
                    properties: {
                        id: {type: "string", description: "Lesson ID"},
                        instructor: {
                            $ref: "#/components/schemas/InstructorResponse",
                            description: "Instructor details"
                        },
                        students: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/StudentResponse"
                            },
                            description: "List of student details"
                        },
                        style: {type: "string", description: "Swimming style"},
                        type: {
                            type: "string",
                            enum: ["private", "group"],
                            description: "Lesson type"
                        },
                        startTime: {type: "string", format: "date-time", description: "Lesson start time"},
                        endTime: {type: "string", format: "date-time", description: "Lesson end time"}
                    },
                },
            },

        },
        servers: [
            {
                url: 'https://swimming-pool-api.onrender.com/',
                description: 'Local server',
            },
        ],
    },
    apis: ['./routes/*.ts'], // Path to route files
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger UI is available at https://swimming-pool-api.onrender.com/api-docs');
};
