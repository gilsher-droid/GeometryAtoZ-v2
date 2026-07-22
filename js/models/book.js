class Book {
  constructor({
    id,
    title,
    ownerId,
    teacherId
  }) {

    this.id = id;
    this.title = title;

    this.ownerId = ownerId;
    this.teacherId = teacherId;

    this.createdAt =
      new Date().toISOString();

    this.updatedAt =
      this.createdAt;

    this.lessons = {};

    this.thinkingKeys = [];

    this.achievements = [];

    this.notes = [];
  }

  addLesson(id, lessonState) {
    this.lessons[id] =
      lessonState;

    this.touch();
  }

  getLesson(id) {
    return this.lessons[id];
  }

  touch() {
    this.updatedAt =
      new Date().toISOString();
  }
}

window.Book = Book;
