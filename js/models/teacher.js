class Teacher {
  constructor({
    id,
    name,
    school = "",
    email = ""
  }) {
    this.id = id;
    this.name = name;
    this.school = school;
    this.email = email;

    this.students = [];
    this.books = [];
  }

  addStudent(studentId) {
    if (!this.students.includes(studentId)) {
      this.students.push(studentId);
    }
  }

  addBook(bookId) {
    if (!this.books.includes(bookId)) {
      this.books.push(bookId);
    }
  }
}

window.Teacher = Teacher;
