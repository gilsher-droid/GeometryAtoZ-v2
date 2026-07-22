class BookManager {

  constructor() {
    this.teacher = null;
    this.student = null;
    this.book = null;
  }

  initialize({
    teacher,
    student,
    book
  }) {

    this.teacher = teacher;
    this.student = student;
    this.book = book;

    teacher.addStudent(student.id);
    teacher.addBook(book.id);

    student.addBook(book.id);
  }

  getLessonState(lessonId) {

    let lessonState =
      this.book.getLesson(lessonId);

    if (!lessonState) {

      lessonState =
        new LessonState();

      lessonState.initialize(
        lessonId
      );

      this.book.addLesson(
        lessonId,
        lessonState
      );
    }

    return lessonState;
  }

  getBook() {
    return this.book;
  }

  getStudent() {
    return this.student;
  }

  getTeacher() {
    return this.teacher;
  }

}

window.BookManager =
  BookManager;
