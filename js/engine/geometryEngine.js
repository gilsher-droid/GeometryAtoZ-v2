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

  calculateDistance(
    firstPoint,
    secondPoint
  ) {
    if (
      !firstPoint ||
      !secondPoint
    ) {
      return null;
    }

    const firstX =
      Number(firstPoint.x);
    const firstY =
      Number(firstPoint.y);
    const secondX =
      Number(secondPoint.x);
    const secondY =
      Number(secondPoint.y);

    if (
      !Number.isFinite(firstX) ||
      !Number.isFinite(firstY) ||
      !Number.isFinite(secondX) ||
      !Number.isFinite(secondY)
    ) {
      return null;
    }

    return Math.hypot(
      firstX - secondX,
      firstY - secondY
    );
  }

  normalizeDegrees(degrees) {
    return (
      (degrees % 360) + 360
    ) % 360;
  }

  getAngleDifference(
    firstDegrees,
    secondDegrees
  ) {
    const difference =
      this.normalizeDegrees(
        firstDegrees -
          secondDegrees +
          180
      ) - 180;

    return Math.abs(
      difference
    );
  }

  getClosestBaselineRotation({
    rotation,
    rayId
  } = {}) {
    const rayVector =
      this.getRayVector(rayId);
    const numericRotation =
      Number(rotation);

    if (
      !rayVector ||
      !Number.isFinite(
        numericRotation
      )
    ) {
      return null;
    }

    const rayRotation =
      this.normalizeDegrees(
        Math.atan2(
          rayVector.y,
          rayVector.x
        ) *
        180 /
        Math.PI
      );
    const candidates = [
      rayRotation,
      this.normalizeDegrees(
        rayRotation + 180
      )
    ];

    return candidates
      .map(
        (candidateRotation) => ({
          rotation:
            candidateRotation,
          difference:
            this.getAngleDifference(
              numericRotation,
              candidateRotation
            ),
          rayRotation
        })
      )
      .sort(
        (first, second) =>
          first.difference -
          second.difference
      )[0];
  }

  checkProtractorAlignment({
    protractor,
    vertexPointId = null,
    baselineRayId = null,
    centerTolerance = 16,
    rotationTolerance = 4
  } = {}) {
    if (!protractor) {
      return {
        status:
          "center-not-aligned",
        centerAligned: false,
        baselineAligned: false,
        centerDistance: null,
        rotationDifference: null
      };
    }

    const resolvedVertexId =
      vertexPointId ||
      protractor.targetVertexId;
    const resolvedRayId =
      baselineRayId ||
      protractor.baselineRayId;

    const vertex =
      this.getPoint(
        resolvedVertexId
      );
    const ray =
      this.getRay(
        resolvedRayId
      );
    const rayVector =
      this.getRayVector(
        resolvedRayId
      );

    if (
      !vertex ||
      !ray ||
      !rayVector ||
      ray.originPointId !==
        vertex.id
    ) {
      return {
        status:
          "center-not-aligned",
        centerAligned: false,
        baselineAligned: false,
        centerDistance: null,
        rotationDifference: null
      };
    }

    const protractorX =
      Number(protractor.x);
    const protractorY =
      Number(protractor.y);
    const protractorRotation =
      Number(protractor.rotation);

    if (
      !Number.isFinite(
        protractorX
      ) ||
      !Number.isFinite(
        protractorY
      ) ||
      !Number.isFinite(
        protractorRotation
      )
    ) {
      return {
        status:
          "center-not-aligned",
        centerAligned: false,
        baselineAligned: false,
        centerDistance: null,
        rotationDifference: null
      };
    }

    const centerDistance =
      Math.hypot(
        protractorX - vertex.x,
        protractorY - vertex.y
      );
    const centerAligned =
      centerDistance <=
      centerTolerance;

    const rayDegrees =
      Math.atan2(
        rayVector.y,
        rayVector.x
      ) *
      180 /
      Math.PI;
    const rotationDifference =
      this.getUndirectedAngleDifference(
        protractorRotation,
        rayDegrees
      );
    const baselineAligned =
      rotationDifference <=
      rotationTolerance;

    return {
      status:
        !centerAligned
          ? "center-not-aligned"
          : !baselineAligned
            ? "baseline-not-aligned"
            : "ready-to-read",
      centerAligned,
      baselineAligned,
      centerDistance,
      rotationDifference
    };
  }

  getUndirectedAngleDifference(
    firstDegrees,
    secondDegrees
  ) {
    const first =
      ((firstDegrees % 180) +
        180) %
      180;
    const second =
      ((secondDegrees % 180) +
        180) %
      180;
    const difference =
      Math.abs(first - second);

    return Math.min(
      difference,
      180 - difference
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
