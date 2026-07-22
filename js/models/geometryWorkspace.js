class GeometryWorkspace {
  constructor({
    id,
    objects = []
  } = {}) {
    if (!id) {
      throw new Error(
        "GeometryWorkspace requires a valid id."
      );
    }

    this.id = id;

    this.objects = Array.isArray(objects)
      ? objects.map(
          (object) => ({
            ...object
          })
        )
      : [];

    this.createdAt =
      new Date().toISOString();

    this.updatedAt =
      this.createdAt;
  }

  addObject(object) {
    if (
      !object ||
      !object.id ||
      !object.type
    ) {
      throw new Error(
        "GeometryWorkspace objects require id and type."
      );
    }

    const existingIndex =
      this.objects.findIndex(
        (currentObject) =>
          currentObject.id === object.id
      );

    if (existingIndex >= 0) {
      this.objects[existingIndex] = {
        ...object
      };
    } else {
      this.objects.push({
        ...object
      });
    }

    this.touch();

    return {
      ...object
    };
  }

  addPoint({
    id,
    x,
    y,
    label = ""
  }) {
    return this.addObject({
      id,
      type: "point",
      x,
      y,
      label
    });
  }

  addRay({
    id,
    originPointId,
    endX,
    endY,
    label = ""
  }) {
    const originPoint =
      this.getObject(
        originPointId
      );

    if (
      !originPoint ||
      originPoint.type !== "point"
    ) {
      throw new Error(
        "A ray requires a valid origin point."
      );
    }

    return this.addObject({
      id,
      type: "ray",
      originPointId,
      endX,
      endY,
      label
    });
  }

  getObject(objectId) {
    const object =
      this.objects.find(
        (currentObject) =>
          currentObject.id === objectId
      );

    return object
      ? {
          ...object
        }
      : null;
  }

  getObjectsByType(type) {
    return this.objects
      .filter(
        (object) =>
          object.type === type
      )
      .map(
        (object) => ({
          ...object
        })
      );
  }

  getAllObjects() {
    return this.objects.map(
      (object) => ({
        ...object
      })
    );
  }

  hasObject(objectId) {
    return this.objects.some(
      (object) =>
        object.id === objectId
    );
  }

  removeObject(objectId) {
    const originalLength =
      this.objects.length;

    this.objects =
      this.objects.filter(
        (object) =>
          object.id !== objectId
      );

    const removed =
      this.objects.length !==
      originalLength;

    if (removed) {
      this.touch();
    }

    return removed;
  }

  clear() {
    this.objects = [];
    this.touch();
  }

  touch() {
    this.updatedAt =
      new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      objects:
        this.getAllObjects(),
      createdAt:
        this.createdAt,
      updatedAt:
        this.updatedAt
    };
  }
}

window.GeometryWorkspace =
  GeometryWorkspace;
