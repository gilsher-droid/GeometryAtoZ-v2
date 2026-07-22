class GeometryEngine {
  constructor({
    workspace
  } = {}) {
    if (
      !workspace ||
      !(workspace instanceof GeometryWorkspace)
    ) {
      throw new Error(
        "GeometryEngine requires a valid GeometryWorkspace."
      );
    }

    this.workspace =
      workspace;
  }

  getPoint(pointId) {
    const point =
      this.workspace.getObject(
        pointId
      );

    if (
      !point ||
      point.type !== "point"
    ) {
      return null;
    }

    return point;
  }

  getRay(rayId) {
    const ray =
      this.workspace.getObject(
        rayId
      );

    if (
      !ray ||
      ray.type !== "ray"
    ) {
      return null;
    }

    return ray;
  }

  getRayVector(rayId) {
    const ray =
      this.getRay(
        rayId
      );

    if (!ray) {
      return null;
    }

    const originPoint =
      this.getPoint(
        ray.originPointId
      );

    if (!originPoint) {
      return null;
    }

    const x =
      ray.endX -
      originPoint.x;

    const y =
      ray.endY -
      originPoint.y;

    const magnitude =
      Math.hypot(
        x,
        y
      );

    if (magnitude === 0) {
      return null;
    }

    return {
      x,
      y,
      magnitude,
      unitX: x / magnitude,
      unitY: y / magnitude
    };
  }

  shareOrigin(
    firstRayId,
    secondRayId
  ) {
    const firstRay =
      this.getRay(
        firstRayId
      );

    const secondRay =
      this.getRay(
        secondRayId
      );

    if (
      !firstRay ||
      !secondRay
    ) {
      return false;
    }

    return (
      firstRay.originPointId ===
      secondRay.originPointId
    );
  }

  calculateAngleDegrees(
    firstRayId,
    secondRayId
  ) {
    if (
      !this.shareOrigin(
        firstRayId,
        secondRayId
      )
    ) {
      return null;
    }

    const firstVector =
      this.getRayVector(
        firstRayId
      );

    const secondVector =
      this.getRayVector(
        secondRayId
      );

    if (
      !firstVector ||
      !secondVector
    ) {
      return null;
    }

    const dotProduct =
      firstVector.unitX *
        secondVector.unitX +
      firstVector.unitY *
        secondVector.unitY;

    /*
      מגנים מפני שגיאות עיגול
      שעלולות לייצר ערך מעט גדול מ־1
      או מעט קטן מ־1-.
    */
    const safeDotProduct =
      Math.max(
        -1,
        Math.min(
          1,
          dotProduct
        )
      );

    const radians =
      Math.acos(
        safeDotProduct
      );

    return (
      radians *
      180 /
      Math.PI
    );
  }

  createAngleDescription({
    id,
    firstRayId,
    secondRayId,
    label = ""
  }) {
    if (!id) {
      throw new Error(
        "Angle description requires a valid id."
      );
    }

    const firstRay =
      this.getRay(
        firstRayId
      );

    const secondRay =
      this.getRay(
        secondRayId
      );

    if (
      !firstRay ||
      !secondRay
    ) {
      return null;
    }

    if (
      !this.shareOrigin(
        firstRayId,
        secondRayId
      )
    ) {
      return null;
    }

    const degrees =
      this.calculateAngleDegrees(
        firstRayId,
        secondRayId
      );

    if (degrees === null) {
      return null;
    }

    return {
      id,
      type: "angle",
      vertexPointId:
        firstRay.originPointId,
      firstRayId,
      secondRayId,
      degrees,
      label
    };
  }

  classifyAngle(degrees) {
    if (
      typeof degrees !== "number" ||
      !Number.isFinite(degrees)
    ) {
      return null;
    }

    const tolerance =
      0.0001;

    if (
      Math.abs(degrees) <
      tolerance
    ) {
      return "zero";
    }

    if (
      degrees <
      90 - tolerance
    ) {
      return "acute";
    }

    if (
      Math.abs(
        degrees - 90
      ) <= tolerance
    ) {
      return "right";
    }

    if (
      degrees <
      180 - tolerance
    ) {
      return "obtuse";
    }

    if (
      Math.abs(
        degrees - 180
      ) <= tolerance
    ) {
      return "straight";
    }

    return "reflex";
  }

  getAngle({
    id = "angle-1",
    firstRayId = "ray-1",
    secondRayId = "ray-2",
    label = ""
  } = {}) {
    const angle =
      this.createAngleDescription({
        id,
        firstRayId,
        secondRayId,
        label
      });

    if (!angle) {
      return null;
    }

    return {
      ...angle,
      classification:
        this.classifyAngle(
          angle.degrees
        )
    };
  }
}

window.GeometryEngine =
  GeometryEngine;
