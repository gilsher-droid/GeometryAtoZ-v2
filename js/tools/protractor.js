class Protractor extends GeometryTool {
  constructor({
    id = "protractor-1",
    x = 0,
    y = 0,
    rotation = 0,
    radius = 130,
    visible = true,
    targetVertexId = null,
    baselineRayId = null
  } = {}) {
    if (!id) {
      throw new Error(
        "Protractor requires a valid id."
      );
    }

    super({
      id,
      x,
      y,
      visible
    });

    this.rotation =
      this.normalizeRotation(
        this.toFiniteNumber(
          rotation,
          0
        )
      );
    this.radius = Math.max(
      50,
      this.toFiniteNumber(
        radius,
        130
      )
    );
    this.targetVertexId =
      targetVertexId || null;
    this.baselineRayId =
      baselineRayId || null;
  }

  update(changes = {}) {
    super.update(changes);

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "rotation"
      )
    ) {
      this.rotation =
        this.normalizeRotation(
          this.toFiniteNumber(
            changes.rotation,
            this.rotation
          )
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "radius"
      )
    ) {
      this.radius = Math.max(
        50,
        this.toFiniteNumber(
          changes.radius,
          this.radius
        )
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "targetVertexId"
      )
    ) {
      this.targetVertexId =
        changes.targetVertexId || null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "baselineRayId"
      )
    ) {
      this.baselineRayId =
        changes.baselineRayId || null;
    }

    return this;
  }

  normalizeRotation(degrees) {
    return (
      (degrees % 360) + 360
    ) % 360;
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      radius: this.radius,
      visible: this.visible,
      targetVertexId:
        this.targetVertexId,
      baselineRayId:
        this.baselineRayId
    };
  }
}

window.Protractor = Protractor;
