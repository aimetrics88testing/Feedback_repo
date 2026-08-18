import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const ADMIN = {
  email: "admin@campusvoice.edu",
  password: "admin123",
  name: "Campus Admin",
};

function createFeedback({
  studentName = null,
  isAnonymous = true,
  courseCode,
  courseName,
  instructor,
  category,
  rating,
  comment,
  status,
  createdAt,
}) {
  const updatedAt = new Date().toISOString();

  return {
    id: randomUUID(),
    studentName,
    isAnonymous,
    courseCode,
    courseName,
    instructor,
    category,
    rating,
    comment,
    status,
    createdAt,
    updatedAt,
  };
}

async function createSeedData() {
  const now = new Date();
  const passwordHash = await bcrypt.hash(ADMIN.password, 10);

  return {
    admins: [
      {
        id: randomUUID(),
        email: ADMIN.email,
        passwordHash,
        name: ADMIN.name,
      },
    ],
    feedback: [
      createFeedback({
        courseCode: "CS201",
        courseName: "Data Structures",
        instructor: "Dr. Mehta",
        category: "teaching",
        rating: 5,
        comment:
          "Clear explanations and helpful office hours. The weekly problem sets really cemented the concepts.",
        status: "new",
        createdAt: now.toISOString(),
      }),

      createFeedback({
        studentName: "Priya Sharma",
        isAnonymous: false,
        courseCode: "ENG110",
        courseName: "Academic Writing",
        instructor: "Prof. Alvarez",
        category: "workload",
        rating: 3,
        comment:
          "Interesting readings, but three essays in one month made it hard to keep quality high across all of them.",
        status: "reviewed",
        createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      }),

      createFeedback({
        courseCode: "MATH240",
        courseName: "Linear Algebra",
        instructor: "Dr. Chen",
        category: "materials",
        rating: 4,
        comment:
          "Lecture notes are excellent. Would love recorded sessions for review before exams.",
        status: "resolved",
        createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      }),
    ],
  };
}

async function saveDatabase(data) {
  const dataDir = path.join(process.cwd(), "data");

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "db.json"),
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

async function main() {
  const db = await createSeedData();

  await saveDatabase(db);

  console.log("✅ Seeded data/db.json");
  console.log(`✅ Admin login: ${ADMIN.email} / ${ADMIN.password}`);
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});