class Student {
  constructor({
    id,
    firstName,
    lastName,
    grade = "",
    teacherId = null
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.grade = grade;
    this.teacherId = teacherId;

    this.books = [];
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  addBook(bookId) {
    if (!this.books.includes(bookId)) {
      this.books.push(bookId);
    }
  }
}

window.Student = Student;
