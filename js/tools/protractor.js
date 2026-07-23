class Protractor extends GeometryTool {
  constructor({
    id = "protractor-1",
    x = 0,
    y = 0,
    rotation = 0,
    radius = 130,
    visible = true,
    targetVertexId = null,
    baselineRayId = null,
    centerSnapped = false,
    baselineSnapped = false,
    centerLocked = false,
    baselineLocked = false
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

    /*
      Snapped state is temporary magnetic
      assistance. Locked state is an
      explicit student choice that persists
      until the matching control releases it.
    */
    this.centerSnapped =
      centerSnapped === true;
    this.baselineSnapped =
      baselineSnapped === true;
    this.centerLocked =
      centerLocked === true;
    this.baselineLocked =
      baselineLocked === true &&
      this.centerLocked;
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

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "centerSnapped"
      )
    ) {
      this.centerSnapped =
        changes.centerSnapped === true;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "baselineSnapped"
      )
    ) {
      this.baselineSnapped =
        changes.baselineSnapped === true;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "centerLocked"
      )
    ) {
      this.centerLocked =
        changes.centerLocked === true;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "baselineLocked"
      )
    ) {
      this.baselineLocked =
        changes.baselineLocked === true &&
        this.centerLocked;
    }

    if (!this.centerLocked) {
      this.baselineLocked = false;
    }

    if (this.centerLocked) {
      this.centerSnapped = false;
    }

    if (this.baselineLocked) {
      this.baselineSnapped = false;
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
        this.baselineRayId,
      centerSnapped:
        this.centerSnapped,
      baselineSnapped:
        this.baselineSnapped,
      centerLocked:
        this.centerLocked,
      baselineLocked:
        this.baselineLocked
    };
  }
}

window.Protractor = Protractor;
