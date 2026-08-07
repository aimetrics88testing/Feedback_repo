import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const now = new Date().toISOString();

  const db = {
    admins: [
      {
        id: randomUUID(),
        email: "admin@campusvoice.edu",
        passwordHash,
        name: "Campus Admin",
      },
    ],
    feedback: [
      {
        id: randomUUID(),
        studentName: null,
        isAnonymous: true,
        courseCode: "CS201",
        courseName: "Data Structures",
        instructor: "Dr. Mehta",
        category: "teaching",
        rating: 5,
        comment:
          "Clear explanations and helpful office hours. The weekly problem sets really cemented the concepts.",
        status: "new",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
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
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: now,
      },
      {
        id: randomUUID(),
        studentName: null,
        isAnonymous: true,
        courseCode: "MATH240",
        courseName: "Linear Algebra",
        instructor: "Dr. Chen",
        category: "materials",
        rating: 4,
        comment:
          "Lecture notes are excellent. Would love recorded sessions for review before exams.",
        status: "resolved",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: now,
      },
    ],
  };

  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "db.json"),
    JSON.stringify(db, null, 2),
    "utf-8",
  );

  console.log("Seeded data/db.json");
  console.log("Admin login: admin@campusvoice.edu / admin123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
