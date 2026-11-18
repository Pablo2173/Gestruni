'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const dataFile = path.join(__dirname, 'data.json');

async function readCourses() {
    const content = await fs.readFile(dataFile, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data.courses) ? data.courses : [];
}

async function writeCourses(courses) {
    await fs.writeFile(dataFile, `${JSON.stringify({ courses }, null, 2)}\n`, 'utf8');
}

module.exports = {
    async list() {
        return readCourses();
    },

    async create(course) {
        const courses = await readCourses();
        if (courses.some((item) => item.id.toLowerCase() === course.id.toLowerCase())) {
            const error = new Error('El identificador del curso ya existe');
            error.code = 'COURSE_EXISTS';
            throw error;
        }
        courses.push(course);
        await writeCourses(courses);
        return course;
    },

    async remove(id) {
        const courses = await readCourses();
        const position = courses.findIndex((item) => item.id === id);
        if (position === -1) {
            return false;
        }
        courses.splice(position, 1);
        await writeCourses(courses);
        return true;
    }
};