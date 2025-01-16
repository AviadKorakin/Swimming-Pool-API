import {DayOfWeek, IInstructor, Instructor} from '../models/instructor';

class InstructorService {
    // Add a new instructor with overlap validation
    async addInstructor(instructorData: Omit<IInstructor,'_id'>): Promise<IInstructor> {
        if (instructorData.availableHours) {
            this.validateAvailableHours(instructorData.availableHours);
        }

        // Ensure the name is unique
        instructorData.name = await this.generateUniqueName(instructorData.name);

        const instructor = new Instructor(instructorData);
        return await instructor.save();
    }

    // Update instructor details with overlap validation
    async updateInstructor(
        instructorId: string,
        updatedData: Partial<Omit<IInstructor,'_id'>>
    ): Promise<IInstructor | null> {
        if (updatedData.availableHours) {
            this.validateAvailableHours(updatedData.availableHours);
        }

        return Instructor.findByIdAndUpdate(instructorId, updatedData, { new: true });
    }

    // Validate availableHours for overlapping ranges
    private validateAvailableHours(availableHours: { day: DayOfWeek; start: string; end: string }[]) {
        // Group by day
        const hoursByDay: Record<DayOfWeek, { start: string; end: string }[]> = availableHours.reduce(
            (acc, { day, start, end }) => {
                if (!acc[day]) acc[day] = [];
                acc[day].push({ start, end });
                return acc;
            },
            {} as Record<DayOfWeek, { start: string; end: string }[]>
        );

        // Check for overlaps within each day
        for (const [day, hours] of Object.entries(hoursByDay) as [DayOfWeek, { start: string; end: string }[]][]) {
            hours.sort((a, b) => a.start.localeCompare(b.start)); // Sort by start time

            for (let i = 0; i < hours.length - 1; i++) {
                const current = hours[i];
                const next = hours[i + 1];

                if (current.end > next.start) {
                    throw new Error(
                        `Overlapping time ranges found on ${day}: ${current.start}-${current.end} overlaps with ${next.start}-${next.end}.`
                    );
                }
            }
        }
    }



    // Generate a unique name
    private async generateUniqueName(baseName: string): Promise<string> {
        let uniqueName = baseName;
        let count = 1;

        while (await Instructor.exists({ name: uniqueName })) {
            uniqueName = `${baseName}(${count})`;
            count++;
        }

        return uniqueName;
    }

    // Remove an instructor
    async removeInstructor(instructorId: string): Promise<boolean> {
        const result = await Instructor.findByIdAndDelete(instructorId);
        return result !== null;
    }

    // Get all instructors (with optional pagination)
    async getAllInstructors(
        page: number = 1,
        limit: number = 10
    ): Promise<{ instructors: IInstructor[]; total: number }> {
        const total = await Instructor.countDocuments();
        const instructors = await Instructor.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return { instructors, total };
    }

    // Get instructor by ID
    async getInstructorById(instructorId: string): Promise<IInstructor | null> {
        return Instructor.findById(instructorId);
    }

    // Find available instructors for specific time and styles
    async findAvailableInstructors(day: string, time: string, styles: string[]): Promise<IInstructor[]> {
        return Instructor.find({
            availableHours: {
                $elemMatch: {
                    day: day,
                    start: { $lte: time },
                    end: { $gte: time },
                },
            },
            expertise: { $all: styles }, // Match all styles in the array
        });
    }
}

export const instructorService = new InstructorService();