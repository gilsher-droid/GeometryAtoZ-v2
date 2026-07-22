class GeometryTool {
  constructor({
    id,
    x = 0,
    y = 0,
    visible = true
  } = {}) {
    if (!id) {
      throw new Error(
        "GeometryTool requires a valid id."
      );
    }

    this.id = id;
    this.x = this.toFiniteNumber(x, 0);
    this.y = this.toFiniteNumber(y, 0);
    this.visible =
      visible !== false;
  }

  setPosition(x, y) {
    this.x = this.toFiniteNumber(
      x,
      this.x
    );
    this.y = this.toFiniteNumber(
      y,
      this.y
    );

    return this;
  }

  moveBy(dx, dy) {
    this.x += this.toFiniteNumber(
      dx,
      0
    );
    this.y += this.toFiniteNumber(
      dy,
      0
    );

    return this;
  }

  show() {
    this.visible = true;

    return this;
  }

  hide() {
    this.visible = false;

    return this;
  }

  update(changes = {}) {
    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "x"
      )
    ) {
      this.x = this.toFiniteNumber(
        changes.x,
        this.x
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "y"
      )
    ) {
      this.y = this.toFiniteNumber(
        changes.y,
        this.y
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "visible"
      )
    ) {
      this.visible =
        changes.visible !== false;
    }

    return this;
  }

  toFiniteNumber(value, fallback) {
    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue
    )
      ? numberValue
      : fallback;
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      visible: this.visible
    };
  }
}

window.GeometryTool = GeometryTool;
