const DEFAULT_MODULES = [
  {
    id: "mod-1",
    courseId: "course-1",
    title: "Module 1: Syntax & Environment Setup",
    type: "video",
    content: "Introduction to Java syntax, setting up JDK and IDE. Covers variables, data types, and basic I/O operations.",
    order: 1,
    unlocked: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mod-2",
    courseId: "course-1",
    title: "Module 2: Object-Oriented Structures",
    type: "pdf",
    content: "Classes, objects, inheritance, polymorphism, and encapsulation in Java. Includes UML diagram exercises.",
    order: 2,
    unlocked: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mod-3",
    courseId: "course-1",
    title: "Module 3: Control Flow & Collections",
    type: "video",
    content: "If-else, switch, loops, arrays, ArrayList, and Iterators. Hands-on lab exercises included.",
    order: 3,
    unlocked: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mod-4",
    courseId: "course-2",
    title: "Module 1: Relational Algebra & Keys",
    type: "pdf",
    content: "Fundamentals of relational model, primary keys, foreign keys, and relational algebra operations.",
    order: 1,
    unlocked: true,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mod-5",
    courseId: "course-2",
    title: "Module 2: Normalization & Index Tuning",
    type: "video",
    content: "1NF through BCNF normalization, indexing strategies, query optimization basics.",
    order: 2,
    unlocked: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mod-6",
    courseId: "course-2",
    title: "Module 3: Transactions & Row Locks",
    type: "quiz",
    content: "ACID properties, transaction isolation levels, row-level locking, and deadlock prevention.",
    order: 3,
    unlocked: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_QUIZZES = [
  {
    id: "quiz-1",
    moduleId: "mod-1",
    courseId: "course-1",
    title: "Java Basics Quiz",
    timeLimit: 15,
    questions: [
      {
        id: "q1",
        prompt: "Which keyword is used to create a class in Java?",
        options: ["struct", "class", "object", "define"],
        correctIndex: 1
      },
      {
        id: "q2",
        prompt: "What is the entry point of a Java application?",
        options: ["start()", "init()", "main()", "run()"],
        correctIndex: 2
      },
      {
        id: "q3",
        prompt: "Which data type is used for decimal numbers in Java?",
        options: ["int", "char", "double", "boolean"],
        correctIndex: 2
      }
    ],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "quiz-2",
    moduleId: "mod-4",
    courseId: "course-2",
    title: "Relational Model Quiz",
    timeLimit: 10,
    questions: [
      {
        id: "q4",
        prompt: "What does a primary key uniquely identify?",
        options: ["A table", "A row", "A column", "A database"],
        correctIndex: 1
      },
      {
        id: "q5",
        prompt: "Which normal form eliminates partial dependencies?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctIndex: 1
      }
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_ASSIGNMENTS = [
  {
    id: "assign-1",
    courseId: "course-1",
    moduleId: "mod-2",
    title: "Assignment 1: OOP Design Challenge",
    description: "Design a class hierarchy for a library management system. Implement Book, Member, and Library classes with proper encapsulation and inheritance.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    maxScore: 100,
    rubric: { quality: 40, logic: 40, documentation: 20 },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "assign-2",
    courseId: "course-1",
    moduleId: "mod-3",
    title: "Assignment 2: Collections Lab",
    description: "Implement a student grade tracker using ArrayList. Include methods for adding, removing, and computing averages. Handle edge cases with try-catch.",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    maxScore: 100,
    rubric: { quality: 40, logic: 40, documentation: 20 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "assign-3",
    courseId: "course-2",
    moduleId: "mod-5",
    title: "Assignment 1: SQL Normalization Exercise",
    description: "Given a denormalized schema, normalize it to 3NF. Write SQL CREATE TABLE statements with proper constraints and indexes.",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    maxScore: 100,
    rubric: { quality: 30, logic: 50, documentation: 20 },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: "sub-1",
    assignmentId: "assign-1",
    studentId: "ur-stud-1",
    content: "public class Book {\n    private String title;\n    private String author;\n    private boolean isAvailable;\n\n    public Book(String title, String author) {\n        this.title = title;\n        this.author = author;\n        this.isAvailable = true;\n    }\n\n    public void borrow() {\n        this.isAvailable = false;\n    }\n\n    public void returnBook() {\n        this.isAvailable = true;\n    }\n}",
    similarity: 8,
    status: "graded",
    grade: { quality: 85, logic: 90, documentation: 75, total: 87 },
    feedback: "Good encapsulation. Consider adding input validation in borrow/return methods.",
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sub-2",
    assignmentId: "assign-1",
    studentId: "ur-stud-2",
    content: "public class LibrarySystem {\n    // Student: Kagabo Alain\n    ArrayList<Book> books = new ArrayList<>();\n    \n    public void addBook(Book b) {\n        books.add(b);\n    }\n}",
    similarity: 22,
    status: "submitted",
    grade: null,
    feedback: null,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    gradedAt: null
  },
  {
    id: "sub-3",
    assignmentId: "assign-1",
    studentId: "ur-stud-3",
    content: "public class Book {\n    public String title;\n    public String author;\n    public boolean isAvailable = true;\n}",
    similarity: 42,
    status: "flagged",
    grade: null,
    feedback: null,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    gradedAt: null
  }
];

const DEFAULT_ENROLLMENTS = [
  { id: "enr-1", studentId: "ur-stud-1", courseId: "course-1", enrolledAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "enr-2", studentId: "ur-stud-1", courseId: "course-2", enrolledAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "enr-3", studentId: "ur-stud-2", courseId: "course-1", enrolledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "enr-4", studentId: "ur-stud-3", courseId: "course-1", enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "enr-5", studentId: "ur-stud-3", courseId: "course-2", enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
];

const DEFAULT_QUIZ_ATTEMPTS = [
  {
    id: "attempt-1",
    quizId: "quiz-1",
    studentId: "ur-stud-1",
    answers: { q1: 1, q2: 2, q3: 2 },
    score: 100,
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "attempt-2",
    quizId: "quiz-1",
    studentId: "ur-stud-2",
    answers: { q1: 1, q2: 0, q3: 2 },
    score: 67,
    completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_SCHOOLS = [
  {
    id: "ur-kigali",
    name: "University of Rwanda - Kigali",
    domain: "ur.ac.rw",
    location: "Kigali / Gasabo",
    type: "university",
    contactName: "Dr. Jean Bosco",
    contactPhone: "+250 788 123 456",
    status: "ACTIVE",
    logo: null,
    departments: ["Computer Science", "Information Technology"],
    academicYear: "2025-2026",
    slug: "ur-kigali",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "auca-gishushu",
    name: "Adventist University of Central Africa",
    domain: "auca.ac.rw",
    location: "Kigali / Kicukiro",
    type: "university",
    contactName: "Prof. Agnes M.",
    contactPhone: "+250 788 987 654",
    status: "APPROVED",
    logo: null,
    departments: [],
    academicYear: "",
    slug: "auca",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "iprc-kigali",
    name: "IPRC Kigali - TVET",
    domain: "iprc.ac.rw",
    location: "Kigali / Kicukiro",
    type: "tvet",
    contactName: "Eng. Eric Kabera",
    contactPhone: "+250 783 111 222",
    status: "PENDING",
    logo: null,
    departments: [],
    academicYear: "",
    slug: "iprc-kigali",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_USERS = [
  {
    id: "superadmin-1",
    name: "SomaConnect Operations",
    email: "admin@somaconnect.rw",
    role: "ADMIN",
    status: "Active"
  },
  {
    id: "ur-admin-1",
    username: "uradmin",
    name: "Dr. Jean Bosco",
    email: "j.bosco@ur.ac.rw",
    role: "SCHOOL_ADMIN",
    schoolId: "ur-kigali",
    status: "Active"
  },
  {
    id: "ur-lec-1",
    name: "Dr. Christian Rwabuneza",
    email: "c.rwabuneza@ur.ac.rw",
    role: "LECTURER",
    schoolId: "ur-kigali",
    status: "Active"
  },
  {
    id: "ur-lec-2",
    name: "Marie Claire Uwineza",
    email: "m.claire@ur.ac.rw",
    role: "LECTURER",
    schoolId: "ur-kigali",
    status: "Active"
  },
  {
    id: "ur-stud-1",
    name: "Ganza Kenny",
    email: "g.kenny@ur.ac.rw",
    role: "STUDENT",
    schoolId: "ur-kigali",
    status: "Active"
  },
  {
    id: "ur-stud-2",
    name: "Kagabo Alain",
    email: "k.alain@ur.ac.rw",
    role: "STUDENT",
    schoolId: "ur-kigali",
    status: "Active"
  },
  {
    id: "ur-stud-3",
    name: "Mutoni Divine",
    email: "m.divine@ur.ac.rw",
    role: "STUDENT",
    schoolId: "ur-kigali",
    status: "Active"
  }
];

const DEFAULT_COURSES = [
  {
    id: "course-1",
    code: "CS102",
    title: "Introduction to Java Programming",
    schoolId: "ur-kigali",
    lecturerId: "ur-lec-1",
    skills: ["Java", "OOP", "Debugging"],
    studentsCount: 3,
    submissionRate: 85
  },
  {
    id: "course-2",
    code: "CS204",
    title: "Database Management Systems",
    schoolId: "ur-kigali",
    lecturerId: "ur-lec-2",
    skills: ["SQL", "PostgreSQL", "Database Design"],
    studentsCount: 2,
    submissionRate: 90
  }
];

const initializeDb = () => {
  if (!localStorage.getItem("soma_schools")) {
    localStorage.setItem("soma_schools", JSON.stringify(DEFAULT_SCHOOLS));
  }
  if (!localStorage.getItem("soma_users")) {
    localStorage.setItem("soma_users", JSON.stringify(DEFAULT_USERS));
  } else {
    try {
      const currentUsers = JSON.parse(localStorage.getItem("soma_users") || "[]");
      const hasSuper = currentUsers.some(u => u.email === "admin@somaconnect.rw" || u.role === "ADMIN");
      if (!hasSuper) {
        currentUsers.unshift({
          id: "superadmin-1",
          name: "SomaConnect Operations",
          email: "admin@somaconnect.rw",
          role: "ADMIN",
          status: "Active"
        });
        localStorage.setItem("soma_users", JSON.stringify(currentUsers));
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!localStorage.getItem("soma_courses")) {
    localStorage.setItem("soma_courses", JSON.stringify(DEFAULT_COURSES));
  }
  if (!localStorage.getItem("soma_modules")) {
    localStorage.setItem("soma_modules", JSON.stringify(DEFAULT_MODULES));
  }
  if (!localStorage.getItem("soma_quizzes")) {
    localStorage.setItem("soma_quizzes", JSON.stringify(DEFAULT_QUIZZES));
  }
  if (!localStorage.getItem("soma_assignments")) {
    localStorage.setItem("soma_assignments", JSON.stringify(DEFAULT_ASSIGNMENTS));
  }
  if (!localStorage.getItem("soma_submissions")) {
    localStorage.setItem("soma_submissions", JSON.stringify(DEFAULT_SUBMISSIONS));
  }
  if (!localStorage.getItem("soma_enrollments")) {
    localStorage.setItem("soma_enrollments", JSON.stringify(DEFAULT_ENROLLMENTS));
  }
  if (!localStorage.getItem("soma_quiz_attempts")) {
    localStorage.setItem("soma_quiz_attempts", JSON.stringify(DEFAULT_QUIZ_ATTEMPTS));
  }
};

initializeDb();

export const mockDb = {
  // --- Schools ---
  getSchools: () => {
    return JSON.parse(localStorage.getItem("soma_schools") || "[]");
  },

  getSchool: (id) => {
    const schools = mockDb.getSchools();
    return schools.find((s) => s.id === id || s.slug === id);
  },

  registerSchool: (schoolData) => {
    const schools = mockDb.getSchools();
    const slug = schoolData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const duplicate = schools.find((s) => s.domain === schoolData.domain || s.slug === slug);
    if (duplicate) {
      throw new Error(`School with domain ${schoolData.domain} or similar name already registered.`);
    }
    const newSchool = {
      id: `school-${Date.now()}`,
      name: schoolData.name,
      domain: schoolData.domain.replace("@", "").trim(),
      location: schoolData.location,
      type: schoolData.type,
      contactName: schoolData.contactName,
      contactPhone: schoolData.contactPhone,
      status: "PENDING",
      logo: null,
      departments: [],
      academicYear: "",
      slug: slug,
      createdAt: new Date().toISOString()
    };
    schools.push(newSchool);
    localStorage.setItem("soma_schools", JSON.stringify(schools));
    return newSchool;
  },

  updateSchoolStatus: (schoolId, newStatus) => {
    const schools = mockDb.getSchools();
    const index = schools.findIndex((s) => s.id === schoolId);
    if (index !== -1) {
      schools[index].status = newStatus;
      localStorage.setItem("soma_schools", JSON.stringify(schools));
      if (newStatus === "APPROVED") {
        const school = schools[index];
        const users = mockDb.getUsers();
        const adminEmail = `admin@${school.domain}`;
        const existingAdmin = users.find(u => u.email === adminEmail);
        if (!existingAdmin) {
          const newAdmin = {
            id: `usr-${Date.now()}`,
            username: school.slug + "admin",
            name: school.contactName,
            email: adminEmail,
            role: "SCHOOL_ADMIN",
            schoolId: school.id,
            status: "Active"
          };
          users.push(newAdmin);
          localStorage.setItem("soma_users", JSON.stringify(users));
        }
      }
      return schools[index];
    }
    throw new Error("School not found");
  },

  completeSchoolSetup: (schoolId, setupData) => {
    const schools = mockDb.getSchools();
    const index = schools.findIndex((s) => s.id === schoolId);
    if (index !== -1) {
      schools[index].logo = setupData.logo;
      schools[index].departments = setupData.departments;
      schools[index].academicYear = setupData.academicYear;
      schools[index].status = "ACTIVE";
      localStorage.setItem("soma_schools", JSON.stringify(schools));
      return schools[index];
    }
    throw new Error("School not found");
  },

  // --- Users ---
  getUsers: () => {
    return JSON.parse(localStorage.getItem("soma_users") || "[]");
  },

  getUsersBySchool: (schoolId) => {
    const users = mockDb.getUsers();
    return users.filter((u) => u.schoolId === schoolId);
  },

  getUser: (id) => {
    const users = mockDb.getUsers();
    return users.find((u) => u.id === id);
  },

  addUser: (userData) => {
    const users = mockDb.getUsers();
    const duplicate = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (duplicate) {
      throw new Error(`User with email ${userData.email} already exists.`);
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      schoolId: userData.schoolId,
      status: "Active"
    };
    users.push(newUser);
    localStorage.setItem("soma_users", JSON.stringify(users));
    return newUser;
  },

  updateUser: (userId, updates) => {
    const users = mockDb.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }

    const duplicate = users.find(
      (u) => u.id !== userId && u.email?.toLowerCase() === updates.email?.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`User with email ${updates.email} already exists.`);
    }

    users[index] = {
      ...users[index],
      ...updates,
    };
    localStorage.setItem("soma_users", JSON.stringify(users));
    return users[index];
  },

  removeUser: (userId) => {
    const users = mockDb.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    localStorage.setItem("soma_users", JSON.stringify(filtered));
  },

  // --- Courses ---
  getCourses: () => {
    return JSON.parse(localStorage.getItem("soma_courses") || "[]");
  },

  getCoursesBySchool: (schoolId) => {
    const courses = mockDb.getCourses();
    return courses.filter((c) => c.schoolId === schoolId);
  },

  getCourse: (id) => {
    const courses = mockDb.getCourses();
    return courses.find((c) => c.id === id);
  },

  addCourse: (courseData) => {
    const courses = mockDb.getCourses();
    const newCourse = {
      id: `course-${Date.now()}`,
      code: courseData.code,
      title: courseData.title,
      schoolId: courseData.schoolId,
      lecturerId: courseData.lecturerId || null,
      skills: courseData.skills || [],
      studentsCount: courseData.studentsCount || 0,
      submissionRate: courseData.submissionRate || 100
    };
    courses.push(newCourse);
    localStorage.setItem("soma_courses", JSON.stringify(courses));
    return newCourse;
  },

  // --- Modules ---
  getModules: () => {
    return JSON.parse(localStorage.getItem("soma_modules") || "[]");
  },

  getModulesByCourse: (courseId) => {
    const modules = mockDb.getModules();
    return modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order);
  },

  getModule: (id) => {
    const modules = mockDb.getModules();
    return modules.find((m) => m.id === id);
  },

  addModule: (moduleData) => {
    const modules = mockDb.getModules();
    const courseModules = modules.filter((m) => m.courseId === moduleData.courseId);
    const newModule = {
      id: `mod-${Date.now()}`,
      courseId: moduleData.courseId,
      title: moduleData.title,
      type: moduleData.type || "video",
      content: moduleData.content || "",
      order: courseModules.length + 1,
      unlocked: courseModules.length === 0,
      createdAt: new Date().toISOString()
    };
    modules.push(newModule);
    localStorage.setItem("soma_modules", JSON.stringify(modules));
    return newModule;
  },

  updateModule: (moduleId, updates) => {
    const modules = mockDb.getModules();
    const index = modules.findIndex((m) => m.id === moduleId);
    if (index !== -1) {
      modules[index] = { ...modules[index], ...updates };
      localStorage.setItem("soma_modules", JSON.stringify(modules));
      return modules[index];
    }
    throw new Error("Module not found");
  },

  deleteModule: (moduleId) => {
    const modules = mockDb.getModules();
    const filtered = modules.filter((m) => m.id !== moduleId);
    localStorage.setItem("soma_modules", JSON.stringify(filtered));
  },

  // --- Quizzes ---
  getQuizzes: () => {
    return JSON.parse(localStorage.getItem("soma_quizzes") || "[]");
  },

  getQuizzesByCourse: (courseId) => {
    const quizzes = mockDb.getQuizzes();
    return quizzes.filter((q) => q.courseId === courseId);
  },

  getQuizzesByModule: (moduleId) => {
    const quizzes = mockDb.getQuizzes();
    return quizzes.filter((q) => q.moduleId === moduleId);
  },

  getQuiz: (id) => {
    const quizzes = mockDb.getQuizzes();
    return quizzes.find((q) => q.id === id);
  },

  addQuiz: (quizData) => {
    const quizzes = mockDb.getQuizzes();
    const newQuiz = {
      id: `quiz-${Date.now()}`,
      moduleId: quizData.moduleId,
      courseId: quizData.courseId,
      title: quizData.title,
      timeLimit: quizData.timeLimit || 15,
      questions: quizData.questions || [],
      createdAt: new Date().toISOString()
    };
    quizzes.push(newQuiz);
    localStorage.setItem("soma_quizzes", JSON.stringify(quizzes));
    return newQuiz;
  },

  addQuestionToQuiz: (quizId, questionData) => {
    const quizzes = mockDb.getQuizzes();
    const index = quizzes.findIndex((q) => q.id === quizId);
    if (index !== -1) {
      const question = {
        id: `q-${Date.now()}`,
        prompt: questionData.prompt,
        options: questionData.options,
        correctIndex: questionData.correctIndex
      };
      quizzes[index].questions.push(question);
      localStorage.setItem("soma_quizzes", JSON.stringify(quizzes));
      return question;
    }
    throw new Error("Quiz not found");
  },

  // --- Assignments ---
  getAssignments: () => {
    return JSON.parse(localStorage.getItem("soma_assignments") || "[]");
  },

  getAssignmentsByCourse: (courseId) => {
    const assignments = mockDb.getAssignments();
    return assignments.filter((a) => a.courseId === courseId);
  },

  getAssignment: (id) => {
    const assignments = mockDb.getAssignments();
    return assignments.find((a) => a.id === id);
  },

  addAssignment: (assignmentData) => {
    const assignments = mockDb.getAssignments();
    const newAssignment = {
      id: `assign-${Date.now()}`,
      courseId: assignmentData.courseId,
      moduleId: assignmentData.moduleId || null,
      title: assignmentData.title,
      description: assignmentData.description || "",
      dueDate: assignmentData.dueDate || null,
      maxScore: assignmentData.maxScore || 100,
      rubric: assignmentData.rubric || { quality: 40, logic: 40, documentation: 20 },
      createdAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    localStorage.setItem("soma_assignments", JSON.stringify(assignments));
    return newAssignment;
  },

  // --- Submissions ---
  getSubmissions: () => {
    return JSON.parse(localStorage.getItem("soma_submissions") || "[]");
  },

  getSubmissionsByAssignment: (assignmentId) => {
    const submissions = mockDb.getSubmissions();
    return submissions.filter((s) => s.assignmentId === assignmentId);
  },

  getSubmissionsByStudent: (studentId) => {
    const submissions = mockDb.getSubmissions();
    return submissions.filter((s) => s.studentId === studentId);
  },

  getSubmission: (id) => {
    const submissions = mockDb.getSubmissions();
    return submissions.find((s) => s.id === id);
  },

  addSubmission: (submissionData) => {
    const submissions = mockDb.getSubmissions();
    const existing = submissions.find(
      (s) => s.assignmentId === submissionData.assignmentId && s.studentId === submissionData.studentId
    );
    if (existing) {
      throw new Error("You have already submitted this assignment.");
    }
    const newSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId: submissionData.assignmentId,
      studentId: submissionData.studentId,
      content: submissionData.content || "",
      similarity: Math.floor(Math.random() * 40) + 5,
      status: "submitted",
      grade: null,
      feedback: null,
      submittedAt: new Date().toISOString(),
      gradedAt: null
    };
    submissions.push(newSubmission);
    localStorage.setItem("soma_submissions", JSON.stringify(submissions));
    return newSubmission;
  },

  gradeSubmission: (submissionId, gradeData) => {
    const submissions = mockDb.getSubmissions();
    const index = submissions.findIndex((s) => s.id === submissionId);
    if (index !== -1) {
      const total = Math.round(
        (gradeData.quality * (submissions[index].rubric?.quality || 40) / 100) +
        (gradeData.logic * (submissions[index].rubric?.logic || 40) / 100) +
        (gradeData.documentation * (submissions[index].rubric?.documentation || 20) / 100)
      );
      const assignment = mockDb.getAssignment(submissions[index].assignmentId);
      const rubric = assignment?.rubric || { quality: 40, logic: 40, documentation: 20 };
      const weightedTotal = Math.round(
        (gradeData.quality * rubric.quality / 100) +
        (gradeData.logic * rubric.logic / 100) +
        (gradeData.documentation * rubric.documentation / 100)
      );
      submissions[index].grade = {
        quality: gradeData.quality,
        logic: gradeData.logic,
        documentation: gradeData.documentation,
        total: weightedTotal
      };
      submissions[index].feedback = gradeData.feedback || "";
      submissions[index].status = "graded";
      submissions[index].gradedAt = new Date().toISOString();
      localStorage.setItem("soma_submissions", JSON.stringify(submissions));
      return submissions[index];
    }
    throw new Error("Submission not found");
  },

  // --- Enrollments ---
  getEnrollments: () => {
    return JSON.parse(localStorage.getItem("soma_enrollments") || "[]");
  },

  getEnrollmentsByStudent: (studentId) => {
    const enrollments = mockDb.getEnrollments();
    return enrollments.filter((e) => e.studentId === studentId);
  },

  getEnrollmentsByCourse: (courseId) => {
    const enrollments = mockDb.getEnrollments();
    return enrollments.filter((e) => e.courseId === courseId);
  },

  enrollStudent: (studentId, courseId) => {
    const enrollments = mockDb.getEnrollments();
    const existing = enrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId
    );
    if (existing) return existing;
    const newEnrollment = {
      id: `enr-${Date.now()}`,
      studentId,
      courseId,
      enrolledAt: new Date().toISOString()
    };
    enrollments.push(newEnrollment);
    localStorage.setItem("soma_enrollments", JSON.stringify(enrollments));
    return newEnrollment;
  },

  // --- Quiz Attempts ---
  getQuizAttempts: () => {
    return JSON.parse(localStorage.getItem("soma_quiz_attempts") || "[]");
  },

  getQuizAttemptsByStudent: (studentId) => {
    const attempts = mockDb.getQuizAttempts();
    return attempts.filter((a) => a.studentId === studentId);
  },

  getQuizAttemptsByQuiz: (quizId) => {
    const attempts = mockDb.getQuizAttempts();
    return attempts.filter((a) => a.quizId === quizId);
  },

  submitQuizAttempt: (attemptData) => {
    const attempts = mockDb.getQuizAttempts();
    const quiz = mockDb.getQuiz(attemptData.quizId);
    if (!quiz) throw new Error("Quiz not found");

    let correct = 0;
    quiz.questions.forEach((q) => {
      if (attemptData.answers[q.id] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);

    const newAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: attemptData.quizId,
      studentId: attemptData.studentId,
      answers: attemptData.answers,
      score,
      completedAt: new Date().toISOString()
    };
    attempts.push(newAttempt);
    localStorage.setItem("soma_quiz_attempts", JSON.stringify(attempts));
    return newAttempt;
  },

  // --- Aggregated helpers ---
  getStudentDashboardData: (studentId) => {
    const enrollments = mockDb.getEnrollmentsByStudent(studentId);
    const allSubmissions = mockDb.getSubmissionsByStudent(studentId);
    const quizAttempts = mockDb.getQuizAttemptsByStudent(studentId);

    const courses = enrollments.map((enr) => {
      const course = mockDb.getCourse(enr.courseId);
      if (!course) return null;
      const modules = mockDb.getModulesByCourse(course.id);
      const quizzes = mockDb.getQuizzesByCourse(course.id);
      const assignments = mockDb.getAssignmentsByCourse(course.id);
      const lecturer = mockDb.getUser(course.lecturerId);

      const courseSubmissions = allSubmissions.filter((s) =>
        assignments.some((a) => a.id === s.assignmentId)
      );
      const courseQuizAttempts = quizAttempts.filter((a) =>
        quizzes.some((q) => q.id === a.quizId)
      );

      const gradedCount = courseSubmissions.filter((s) => s.status === "graded").length;
      const pendingCount = assignments.length - courseSubmissions.length;
      const avgGrade = courseSubmissions.filter((s) => s.grade)
        .reduce((sum, s) => sum + s.grade.total, 0) / (gradedCount || 1);
      const avgQuizScore = courseQuizAttempts.length > 0
        ? courseQuizAttempts.reduce((sum, a) => sum + a.score, 0) / courseQuizAttempts.length
        : null;

      const completedModules = modules.filter((m) => m.unlocked).length;

      return {
        ...course,
        lecturerName: lecturer?.name || "Unassigned",
        modules,
        quizzes,
        assignments,
        submissions: courseSubmissions,
        quizAttempts: courseQuizAttempts,
        stats: {
          completedModules,
          totalModules: modules.length,
          moduleProgress: modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0,
          gradedSubmissions: gradedCount,
          pendingSubmissions: pendingCount,
          avgGrade: Math.round(avgGrade),
          avgQuizScore: avgQuizScore !== null ? Math.round(avgQuizScore) : null
        }
      };
    }).filter(Boolean);

    const totalAssignments = courses.reduce((sum, c) => sum + c.assignments.length, 0);
    const totalSubmitted = allSubmissions.length;
    const totalGraded = allSubmissions.filter((s) => s.status === "graded").length;
    const overallAvg = allSubmissions.filter((s) => s.grade)
      .reduce((sum, s) => sum + s.grade.total, 0) / (totalGraded || 1);

    return {
      courses,
      summary: {
        enrolledCourses: courses.length,
        totalAssignments,
        submittedCount: totalSubmitted,
        gradedCount: totalGraded,
        pendingCount: totalAssignments - totalSubmitted,
        overallAvg: Math.round(overallAvg)
      }
    };
  },

  getSchoolMetrics: (schoolId) => {
    const students = mockDb.getUsersBySchool(schoolId).filter(u => u.role === 'STUDENT');
    const lecturers = mockDb.getUsersBySchool(schoolId).filter(u => u.role === 'LECTURER');
    const courses = mockDb.getCoursesBySchool(schoolId);

    let totalRate = 0;
    courses.forEach(c => totalRate += c.submissionRate || 100);
    const avgSubmissionRate = courses.length > 0 ? Math.round(totalRate / courses.length) : 0;

    return {
      enrolledStudents: students.length,
      lecturersCount: lecturers.length,
      coursesCount: courses.length,
      submissionRate: avgSubmissionRate,
      recentActivity: [
        { id: 1, action: "Student bulk registration complete", time: "2 hours ago" },
        { id: 2, action: `New Course added: ${courses[0]?.title || 'Java Programming'}`, time: "Yesterday" },
        { id: 3, action: "School profile KYC approved by SomaConnect", time: "2 days ago" }
      ]
    };
  }
};
