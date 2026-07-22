class GeometryCanvas {
  constructor({
    id,
    width = 640,
    height = 360,
    className = "",
    onPointCreated = null,
    onRayCreated = null
  } = {}) {
    if (!id) {
      throw new Error(
        "GeometryCanvas requires a valid id."
      );
    }

    this.id = id;
    this.width = width;
    this.height = height;
    this.className = className;

    this.onPointCreated =
      onPointCreated;

    this.onRayCreated =
      onRayCreated;

    this.element = null;
    this.objects = [];

    this.boundClickHandler = null;
    this.boundPointerDownHandler = null;
    this.boundPointerMoveHandler = null;
    this.boundPointerUpHandler = null;

    this.rayOriginPointId = null;
    this.activeRayStart = null;
    this.previewRayElement = null;

    this.protractorElement = null;
    this.protractorState = null;
    this.protractorChangeHandler = null;
    this.protractorSnapOptions = null;
    this.protractorInteraction = null;
    this.boundProtractorPointerDown = null;
    this.boundProtractorPointerMove = null;
    this.boundProtractorPointerUp = null;
  }

  render() {
    return `
      <div
        id="${this.id}"
        class="geometry-canvas ${this.className}"
        role="application"
        tabindex="0"
        aria-label="משטח גיאומטרי אינטראקטיבי"
        style="
          position: relative;
          width: 100%;
          max-width: ${this.width}px;
          height: ${this.height}px;
          overflow: hidden;
          touch-action: none;
        "
      ></div>
    `;
  }

  attach() {
    this.element =
      document.getElementById(
        this.id
      );

    if (!this.element) {
      throw new Error(
        `GeometryCanvas could not find element "${this.id}".`
      );
    }
  }

  enablePointCreation() {
    this.ensureAttached();

    this.disablePointCreation();
    this.disableRayCreation();

    this.boundClickHandler =
      (event) => {
        const position =
          this.getRelativePosition(
            event
          );

        this.setSinglePoint(
          position.x,
          position.y
        );

        if (
          typeof this.onPointCreated ===
          "function"
        ) {
          this.onPointCreated({
            x: position.x,
            y: position.y
          });
        }
      };

    this.element.addEventListener(
      "click",
      this.boundClickHandler
    );
  }

  disablePointCreation() {
    if (
      this.element &&
      this.boundClickHandler
    ) {
      this.element.removeEventListener(
        "click",
        this.boundClickHandler
      );
    }

    this.boundClickHandler = null;
  }

  enableRayCreation({
    originPointId
  } = {}) {
    this.ensureAttached();

    if (!originPointId) {
      throw new Error(
        "Ray creation requires an originPointId."
      );
    }

    const originPoint =
      this.getObject(
        originPointId
      );

    if (
      !originPoint ||
      originPoint.type !== "point"
    ) {
      throw new Error(
        "Ray creation requires a valid origin point."
      );
    }

    this.disablePointCreation();
    this.disableRayCreation();

    this.rayOriginPointId =
      originPointId;

    this.boundPointerDownHandler =
      (event) => {
        const position =
          this.getRelativePosition(
            event
          );

        const currentOrigin =
          this.getObject(
            this.rayOriginPointId
          );

        if (
          !currentOrigin ||
          !this.isNearPoint(
            position,
            currentOrigin
          )
        ) {
          return;
        }

        event.preventDefault();

        this.activeRayStart = {
          x: currentOrigin.x,
          y: currentOrigin.y
        };

        this.element.setPointerCapture(
          event.pointerId
        );
      };

    this.boundPointerMoveHandler =
      (event) => {
        if (!this.activeRayStart) {
          return;
        }

        event.preventDefault();

        const position =
          this.getRelativePosition(
            event
          );

        this.drawRayPreview({
          startX:
            this.activeRayStart.x,
          startY:
            this.activeRayStart.y,
          endX:
            position.x,
          endY:
            position.y
        });
      };

    this.boundPointerUpHandler =
      (event) => {
        if (!this.activeRayStart) {
          return;
        }

        event.preventDefault();

        const position =
          this.getRelativePosition(
            event
          );

        const distance =
          Math.hypot(
            position.x -
              this.activeRayStart.x,
            position.y -
              this.activeRayStart.y
          );

        this.removeRayPreview();

        if (distance < 20) {
          this.activeRayStart = null;
          return;
        }

        const rayData = {
          originPointId:
            this.rayOriginPointId,
          endX: position.x,
          endY: position.y
        };

        if (
          typeof this.onRayCreated ===
          "function"
        ) {
          this.onRayCreated(
            rayData
          );
        }

        this.activeRayStart = null;
      };

    this.element.addEventListener(
      "pointerdown",
      this.boundPointerDownHandler
    );

    this.element.addEventListener(
      "pointermove",
      this.boundPointerMoveHandler
    );

    this.element.addEventListener(
      "pointerup",
      this.boundPointerUpHandler
    );

    this.element.addEventListener(
      "pointercancel",
      this.boundPointerUpHandler
    );
  }

  disableRayCreation() {
    if (!this.element) {
      return;
    }

    if (
      this.boundPointerDownHandler
    ) {
      this.element.removeEventListener(
        "pointerdown",
        this.boundPointerDownHandler
      );
    }

    if (
      this.boundPointerMoveHandler
    ) {
      this.element.removeEventListener(
        "pointermove",
        this.boundPointerMoveHandler
      );
    }

    if (
      this.boundPointerUpHandler
    ) {
      this.element.removeEventListener(
        "pointerup",
        this.boundPointerUpHandler
      );

      this.element.removeEventListener(
        "pointercancel",
        this.boundPointerUpHandler
      );
    }

    this.boundPointerDownHandler = null;
    this.boundPointerMoveHandler = null;
    this.boundPointerUpHandler = null;

    this.rayOriginPointId = null;
    this.activeRayStart = null;

    this.removeRayPreview();
  }

  ensureAttached() {
    if (!this.element) {
      throw new Error(
        "GeometryCanvas.attach() must be called before enabling interactions."
      );
    }
  }

  getRelativePosition(event) {
    if (!this.element) {
      return {
        x: 0,
        y: 0
      };
    }

    const rect =
      this.element
        .getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top
    };
  }

  isNearPoint(
    position,
    point,
    tolerance = 22
  ) {
    return (
      Math.hypot(
        position.x - point.x,
        position.y - point.y
      ) <= tolerance
    );
  }

  setSinglePoint(x, y) {
    this.clear();

    return this.addPoint(
      x,
      y
    );
  }

  addPoint(
    x,
    y,
    options = {}
  ) {
    const point = {
      id:
        options.id ||
        `point-${Date.now()}`,

      type: "point",
      x,
      y,
      label:
        options.label || ""
    };

    this.objects.push(
      point
    );

    this.drawPoint(
      point
    );

    return {
      ...point
    };
  }

  addRay(
    originPointId,
    endX,
    endY,
    options = {}
  ) {
    const originPoint =
      this.getObject(
        originPointId
      );

    if (
      !originPoint ||
      originPoint.type !== "point"
    ) {
      throw new Error(
        "Cannot draw a ray without a valid origin point."
      );
    }

    const ray = {
      id:
        options.id ||
        `ray-${Date.now()}`,

      type: "ray",
      originPointId,
      endX,
      endY,
      label:
        options.label || ""
    };

    this.objects.push(
      ray
    );

    this.drawRay(
      ray
    );

    return {
      ...ray
    };
  }

  drawPoint(point) {
    if (!this.element) {
      return;
    }

    const pointElement =
      document.createElement(
        "div"
      );

    pointElement.className =
      "geometry-point created-point";

    pointElement.dataset.objectId =
      point.id;

    pointElement.style.position =
      "absolute";

    pointElement.style.left =
      `${point.x}px`;

    pointElement.style.top =
      `${point.y}px`;

    pointElement.style.transform =
      "translate(-50%, -50%)";

    pointElement.style.zIndex =
      "4";

    this.element.appendChild(
      pointElement
    );

    if (point.label) {
      const labelElement =
        document.createElement(
          "span"
        );

      labelElement.className =
        "geometry-point-label";

      labelElement.textContent =
        point.label;

      pointElement.appendChild(
        labelElement
      );
    }
  }

  drawRay(ray) {
    if (!this.element) {
      return;
    }

    const originPoint =
      this.getObject(
        ray.originPointId
      );

    if (!originPoint) {
      return;
    }

    const rayEnd =
      this.getRayBoundaryPoint({
        startX:
          originPoint.x,
        startY:
          originPoint.y,
        directionX:
          ray.endX -
          originPoint.x,
        directionY:
          ray.endY -
          originPoint.y
      });

    if (!rayEnd) {
      return;
    }

    const rayElement =
      this.createLineElement({
        startX:
          originPoint.x,
        startY:
          originPoint.y,
        endX:
          rayEnd.x,
        endY:
          rayEnd.y,
        className:
          "geometry-ray"
      });

    rayElement.dataset.objectId =
      ray.id;

    rayElement.style.zIndex =
      "1";

    this.element.appendChild(
      rayElement
    );

    const arrowElement =
      document.createElement(
        "div"
      );

    arrowElement.className =
      "geometry-ray-arrow";

    arrowElement.style.position =
      "absolute";

    arrowElement.style.left =
      `${rayEnd.x}px`;

    arrowElement.style.top =
      `${rayEnd.y}px`;

    const angle =
      Math.atan2(
        rayEnd.y -
          originPoint.y,
        rayEnd.x -
          originPoint.x
      );

    arrowElement.style.transform =
      `translate(-50%, -50%) rotate(${angle}rad)`;

    arrowElement.style.zIndex =
      "2";

    arrowElement.textContent =
      "▶";

    this.element.appendChild(
      arrowElement
    );
  }

  drawRayPreview({
    startX,
    startY,
    endX,
    endY
  }) {
    this.removeRayPreview();

    const boundaryPoint =
      this.getRayBoundaryPoint({
        startX,
        startY,
        directionX:
          endX - startX,
        directionY:
          endY - startY
      });

    if (!boundaryPoint) {
      return;
    }

    this.previewRayElement =
      this.createLineElement({
        startX,
        startY,
        endX:
          boundaryPoint.x,
        endY:
          boundaryPoint.y,
        className:
          "geometry-ray geometry-ray-preview"
      });

    this.previewRayElement.style.zIndex =
      "1";

    this.element.appendChild(
      this.previewRayElement
    );
  }

  createLineElement({
    startX,
    startY,
    endX,
    endY,
    className
  }) {
    const lineElement =
      document.createElement(
        "div"
      );

    const length =
      Math.hypot(
        endX - startX,
        endY - startY
      );

    const angle =
      Math.atan2(
        endY - startY,
        endX - startX
      );

    lineElement.className =
      className;

    lineElement.style.position =
      "absolute";

    lineElement.style.left =
      `${startX}px`;

    lineElement.style.top =
      `${startY}px`;

    lineElement.style.width =
      `${length}px`;

    lineElement.style.transformOrigin =
      "0 50%";

    lineElement.style.transform =
      `translateY(-50%) rotate(${angle}rad)`;

    return lineElement;
  }

  drawAngleMarker({
    firstRayId,
    secondRayId,
    radius = 48,
    showDegrees = true
  } = {}) {
    if (!this.element) {
      return;
    }

    const firstRay =
      this.getObject(
        firstRayId
      );

    const secondRay =
      this.getObject(
        secondRayId
      );

    if (
      !firstRay ||
      !secondRay ||
      firstRay.type !== "ray" ||
      secondRay.type !== "ray" ||
      firstRay.originPointId !==
        secondRay.originPointId
    ) {
      return;
    }

    const vertex =
      this.getObject(
        firstRay.originPointId
      );

    if (!vertex) {
      return;
    }

    this.removeAngleMarker();

    const firstAngle =
      Math.atan2(
        firstRay.endY -
          vertex.y,
        firstRay.endX -
          vertex.x
      );

    const secondAngle =
      Math.atan2(
        secondRay.endY -
          vertex.y,
        secondRay.endX -
          vertex.x
      );

    let difference =
      secondAngle -
      firstAngle;

    while (
      difference >
      Math.PI
    ) {
      difference -=
        2 * Math.PI;
    }

    while (
      difference <
      -Math.PI
    ) {
      difference +=
        2 * Math.PI;
    }

    const endAngle =
      firstAngle +
      difference;

    const startX =
      vertex.x +
      radius *
      Math.cos(
        firstAngle
      );

    const startY =
      vertex.y +
      radius *
      Math.sin(
        firstAngle
      );

    const endX =
      vertex.x +
      radius *
      Math.cos(
        endAngle
      );

    const endY =
      vertex.y +
      radius *
      Math.sin(
        endAngle
      );

    const sweepFlag =
      difference >= 0
        ? 1
        : 0;

    const angleDegrees =
      Math.abs(
        difference *
        180 /
        Math.PI
      );

    const svgNamespace =
      "http://www.w3.org/2000/svg";

    const svg =
      document.createElementNS(
        svgNamespace,
        "svg"
      );

    svg.classList.add(
      "geometry-angle-marker"
    );

    svg.style.position =
      "absolute";

    svg.style.inset =
      "0";

    svg.style.width =
      "100%";

    svg.style.height =
      "100%";

    svg.style.pointerEvents =
      "none";

    svg.style.zIndex =
      "3";

    svg.style.overflow =
      "visible";

    const path =
      document.createElementNS(
        svgNamespace,
        "path"
      );

    path.setAttribute(
      "d",
      `
        M ${startX} ${startY}
        A ${radius} ${radius}
        0 0 ${sweepFlag}
        ${endX} ${endY}
      `
    );

    path.setAttribute(
      "class",
      "geometry-angle-arc"
    );

    svg.appendChild(
      path
    );

    if (showDegrees) {
      const middleAngle =
        firstAngle +
        difference / 2;

      const labelRadius =
        radius + 22;

      const labelX =
        vertex.x +
        labelRadius *
        Math.cos(
          middleAngle
        );

      const labelY =
        vertex.y +
        labelRadius *
        Math.sin(
          middleAngle
        );

      const label =
        document.createElementNS(
          svgNamespace,
          "text"
        );

      label.setAttribute(
        "x",
        labelX
      );

      label.setAttribute(
        "y",
        labelY
      );

      label.setAttribute(
        "class",
        "geometry-angle-label"
      );

      label.setAttribute(
        "text-anchor",
        "middle"
      );

      label.setAttribute(
        "dominant-baseline",
        "middle"
      );

      label.textContent =
        `${Math.round(
          angleDegrees * 10
        ) / 10}°`;

      svg.appendChild(
        label
      );
    }

    this.element.appendChild(
      svg
    );
  }

  removeAngleMarker() {
    if (!this.element) {
      return;
    }

    this.element
      .querySelectorAll(
        ".geometry-angle-marker"
      )
      .forEach(
        (marker) => {
          marker.remove();
        }
      );
  }

  drawProtractor(
    protractor,
    {
      onChange = null,
      snapping = null
    } = {}
  ) {
    this.ensureAttached();
    this.removeProtractor();

    this.protractorState =
      protractor instanceof Protractor
        ? protractor
        : new Protractor(
            protractor
          );

    this.protractorChangeHandler =
      typeof onChange ===
      "function"
        ? onChange
        : null;
    this.protractorSnapOptions =
      this.normalizeProtractorSnapping(
        snapping
      );

    const svgNamespace =
      "http://www.w3.org/2000/svg";

    const svg =
      document.createElementNS(
        svgNamespace,
        "svg"
      );

    svg.classList.add(
      "geometry-protractor"
    );
    svg.dataset.protractorId =
      this.protractorState.id;
    svg.setAttribute(
      "aria-label",
      "מד זווית אינטראקטיבי"
    );
    svg.setAttribute(
      "role",
      "img"
    );

    const group =
      document.createElementNS(
        svgNamespace,
        "g"
      );

    group.classList.add(
      "geometry-protractor-content"
    );

    const radius =
      this.protractorState.radius;

    const body =
      document.createElementNS(
        svgNamespace,
        "path"
      );

    body.setAttribute(
      "d",
      `M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0 L ${-radius} 0 Z`
    );
    body.setAttribute(
      "class",
      "geometry-protractor-body"
    );
    body.dataset.protractorAction =
      "drag";
    group.appendChild(body);

    const baseline =
      document.createElementNS(
        svgNamespace,
        "line"
      );

    baseline.setAttribute(
      "x1",
      -radius
    );
    baseline.setAttribute(
      "y1",
      0
    );
    baseline.setAttribute(
      "x2",
      radius
    );
    baseline.setAttribute(
      "y2",
      0
    );
    baseline.setAttribute(
      "class",
      "geometry-protractor-baseline"
    );
    baseline.dataset.protractorAction =
      "drag";
    group.appendChild(
      baseline
    );

    for (
      let degrees = 0;
      degrees <= 180;
      degrees += 1
    ) {
      const radians =
        degrees *
        Math.PI /
        180;

      const tickLength =
        degrees % 10 === 0
          ? 13
          : degrees % 5 === 0
            ? 9
            : 5;

      const outerRadius =
        radius - 2;
      const innerRadius =
        outerRadius - tickLength;

      const tick =
        document.createElementNS(
          svgNamespace,
          "line"
        );

      tick.setAttribute(
        "x1",
        outerRadius *
          Math.cos(radians)
      );
      tick.setAttribute(
        "y1",
        -outerRadius *
          Math.sin(radians)
      );
      tick.setAttribute(
        "x2",
        innerRadius *
          Math.cos(radians)
      );
      tick.setAttribute(
        "y2",
        -innerRadius *
          Math.sin(radians)
      );
      tick.setAttribute(
        "class",
        degrees % 10 === 0
          ? "geometry-protractor-tick geometry-protractor-tick-long"
          : degrees % 5 === 0
            ? "geometry-protractor-tick geometry-protractor-tick-medium"
            : "geometry-protractor-tick"
      );
      group.appendChild(tick);

      if (
        degrees % 10 === 0
      ) {
        this.appendProtractorLabel({
          group,
          svgNamespace,
          degrees,
          value: degrees,
          radius:
            radius - 25,
          className:
            "geometry-protractor-label geometry-protractor-label-outer"
        });

        this.appendProtractorLabel({
          group,
          svgNamespace,
          degrees,
          value:
            180 - degrees,
          radius:
            radius - 40,
          className:
            "geometry-protractor-label geometry-protractor-label-inner"
        });
      }
    }

    const centerGuide =
      document.createElementNS(
        svgNamespace,
        "path"
      );

    centerGuide.setAttribute(
      "d",
      "M -13 0 A 13 13 0 0 1 13 0"
    );
    centerGuide.setAttribute(
      "class",
      "geometry-protractor-center-guide"
    );
    centerGuide.dataset.protractorAction =
      "drag";
    group.appendChild(
      centerGuide
    );

    const center =
      document.createElementNS(
        svgNamespace,
        "circle"
      );

    center.setAttribute("cx", 0);
    center.setAttribute("cy", 0);
    center.setAttribute("r", 7);
    center.setAttribute(
      "class",
      "geometry-protractor-center"
    );
    center.dataset.protractorAction =
      "drag";
    group.appendChild(center);

    const rotationStem =
      document.createElementNS(
        svgNamespace,
        "line"
      );

    rotationStem.setAttribute(
      "x1",
      0
    );
    rotationStem.setAttribute(
      "y1",
      -radius
    );
    rotationStem.setAttribute(
      "x2",
      0
    );
    rotationStem.setAttribute(
      "y2",
      -radius - 24
    );
    rotationStem.setAttribute(
      "class",
      "geometry-protractor-rotation-stem"
    );
    group.appendChild(
      rotationStem
    );

    const rotationHandle =
      document.createElementNS(
        svgNamespace,
        "circle"
      );

    rotationHandle.setAttribute(
      "cx",
      0
    );
    rotationHandle.setAttribute(
      "cy",
      -radius - 24
    );
    rotationHandle.setAttribute(
      "r",
      10
    );
    rotationHandle.setAttribute(
      "class",
      "geometry-protractor-rotation-handle"
    );
    rotationHandle.dataset.protractorAction =
      "rotate";
    group.appendChild(
      rotationHandle
    );

    svg.appendChild(group);
    this.element.appendChild(svg);

    this.protractorElement = svg;

    this.boundProtractorPointerDown =
      (event) => {
        const actionElement =
          event.target.closest(
            "[data-protractor-action]"
          );

        if (!actionElement) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const position =
          this.getRelativePosition(
            event
          );

        this.protractorInteraction = {
          mode:
            actionElement.dataset
              .protractorAction,
          pointerId:
            event.pointerId,
          pointerX: position.x,
          pointerY: position.y,
          startX:
            this.protractorState.x,
          startY:
            this.protractorState.y,
          lockAnchor:
            this.protractorState
              .centerLocked === true,
          lastChangeType: null
        };

        actionElement.setPointerCapture(
          event.pointerId
        );
      };

    this.boundProtractorPointerMove =
      (event) => {
        const interaction =
          this.protractorInteraction;

        if (
          !interaction ||
          interaction.pointerId !==
            event.pointerId
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const position =
          this.getRelativePosition(
            event
          );

        if (
          interaction.mode ===
          "drag"
        ) {
          const bounds =
            this.getCanvasBounds();
          const deltaX =
            position.x -
            interaction.pointerX;
          const deltaY =
            position.y -
            interaction.pointerY;
          const displacement =
            Math.hypot(
              deltaX,
              deltaY
            );
          const previousCenterLocked =
            this.protractorState
              .centerLocked === true;
          let changeType = null;

          if (
            interaction.lockAnchor &&
            displacement <
              this.getCenterUnlockTolerance()
          ) {
            this.attachProtractorToCenterTarget();
          } else {
            if (
              interaction.lockAnchor
            ) {
              interaction.lockAnchor =
                false;
            }

            const candidate = {
              x: this.clamp(
                interaction.startX +
                  deltaX,
                12,
                Math.max(
                  12,
                  bounds.width - 12
                )
              ),
              y: this.clamp(
                interaction.startY +
                  deltaY,
                12,
                Math.max(
                  12,
                  bounds.height - 12
                )
              )
            };
            const centerDistance =
              this.getProtractorCenterDistance(
                candidate
              );
            const shouldSnapCenter =
              centerDistance !== null &&
              centerDistance <=
                this.getCenterSnapTolerance();

            if (shouldSnapCenter) {
              this.attachProtractorToCenterTarget();
              interaction.lockAnchor =
                true;
              interaction.pointerX =
                position.x;
              interaction.pointerY =
                position.y;
              interaction.startX =
                this.protractorState.x;
              interaction.startY =
                this.protractorState.y;
            } else {
              this.protractorState.update({
                ...candidate,
                centerLocked: false,
                baselineLocked: false
              });
            }
          }

          if (
            !previousCenterLocked &&
            this.protractorState
              .centerLocked
          ) {
            changeType =
              "center-snapped";
          } else if (
            previousCenterLocked &&
            !this.protractorState
              .centerLocked
          ) {
            changeType =
              "center-unlocked";
          }

          this.updateProtractor();
          if (changeType) {
            interaction.lastChangeType =
              changeType;
          }
          this.emitProtractorChange(
            changeType
          );
        } else {
          const pointerAngle =
            Math.atan2(
              position.y -
                this.protractorState.y,
              position.x -
                this.protractorState.x
            ) *
            180 /
            Math.PI;

          const rawRotation =
            pointerAngle + 90;
          const previousBaselineLocked =
            this.protractorState
              .baselineLocked === true;
          const baselineTarget =
            this.getProtractorBaselineTarget(
              rawRotation
            );
          let nextRotation =
            rawRotation;
          let baselineLocked = false;
          let changeType = null;

          if (
            this.protractorState
              .centerLocked &&
            baselineTarget
          ) {
            const tolerance =
              previousBaselineLocked
                ? this.getBaselineUnsnapTolerance()
                : this.getBaselineSnapTolerance();

            if (
              baselineTarget.difference <=
              tolerance
            ) {
              nextRotation =
                baselineTarget.rotation;
              baselineLocked = true;
            }
          }

          this.protractorState.update({
            rotation: nextRotation,
            baselineLocked
          });

          if (
            !previousBaselineLocked &&
            baselineLocked
          ) {
            changeType =
              "baseline-snapped";
          } else if (
            previousBaselineLocked &&
            !baselineLocked
          ) {
            changeType =
              "baseline-unlocked";
          }

          this.updateProtractor();
          if (changeType) {
            interaction.lastChangeType =
              changeType;
          }
          this.emitProtractorChange(
            changeType
          );
        }
      };

    this.boundProtractorPointerUp =
      (event) => {
        if (
          !this.protractorInteraction ||
          this.protractorInteraction
            .pointerId !==
            event.pointerId
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const finalChangeType =
          this.protractorInteraction
            .lastChangeType ||
          "interaction-end";
        this.protractorInteraction =
          null;
        this.emitProtractorChange(
          finalChangeType
        );
      };

    group.addEventListener(
      "pointerdown",
      this.boundProtractorPointerDown
    );
    this.element.addEventListener(
      "pointermove",
      this.boundProtractorPointerMove
    );
    this.element.addEventListener(
      "pointerup",
      this.boundProtractorPointerUp
    );
    this.element.addEventListener(
      "pointercancel",
      this.boundProtractorPointerUp
    );

    this.updateProtractor();

    return this.protractorState;
  }

  normalizeProtractorSnapping(
    snapping
  ) {
    if (
      !snapping ||
      !snapping.centerTarget
    ) {
      return null;
    }

    const centerX =
      Number(
        snapping.centerTarget.x
      );
    const centerY =
      Number(
        snapping.centerTarget.y
      );

    if (
      !Number.isFinite(centerX) ||
      !Number.isFinite(centerY)
    ) {
      return null;
    }

    return {
      centerTarget: {
        x: centerX,
        y: centerY
      },
      getCenterDistance:
        typeof snapping
          .getCenterDistance ===
        "function"
          ? snapping.getCenterDistance
          : null,
      getBaselineTarget:
        typeof snapping
          .getBaselineTarget ===
        "function"
          ? snapping.getBaselineTarget
          : null,
      centerSnapTolerance:
        this.toNonNegativeNumber(
          snapping.centerSnapTolerance,
          24
        ),
      centerUnlockTolerance:
        this.toNonNegativeNumber(
          snapping.centerUnlockTolerance,
          32
        ),
      baselineSnapTolerance:
        this.toNonNegativeNumber(
          snapping.baselineSnapTolerance,
          6
        ),
      baselineUnsnapTolerance:
        this.toNonNegativeNumber(
          snapping.baselineUnsnapTolerance,
          10
        )
    };
  }

  toNonNegativeNumber(
    value,
    fallback
  ) {
    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue
    )
      ? Math.max(0, numberValue)
      : fallback;
  }

  getCenterSnapTolerance() {
    return this.protractorSnapOptions
      ? this.protractorSnapOptions
          .centerSnapTolerance
      : 0;
  }

  getCenterUnlockTolerance() {
    return this.protractorSnapOptions
      ? this.protractorSnapOptions
          .centerUnlockTolerance
      : 0;
  }

  getBaselineSnapTolerance() {
    return this.protractorSnapOptions
      ? this.protractorSnapOptions
          .baselineSnapTolerance
      : 0;
  }

  getBaselineUnsnapTolerance() {
    return this.protractorSnapOptions
      ? this.protractorSnapOptions
          .baselineUnsnapTolerance
      : 0;
  }

  getProtractorCenterDistance(
    position
  ) {
    if (!this.protractorSnapOptions) {
      return null;
    }

    if (
      this.protractorSnapOptions
        .getCenterDistance
    ) {
      const distance =
        this.protractorSnapOptions
          .getCenterDistance(position);

      return Number.isFinite(distance)
        ? distance
        : null;
    }

    return Math.hypot(
      position.x -
        this.protractorSnapOptions
          .centerTarget.x,
      position.y -
        this.protractorSnapOptions
          .centerTarget.y
    );
  }

  getProtractorBaselineTarget(
    rotation
  ) {
    if (
      !this.protractorSnapOptions ||
      !this.protractorSnapOptions
        .getBaselineTarget
    ) {
      return null;
    }

    const target =
      this.protractorSnapOptions
        .getBaselineTarget(rotation);

    if (
      !target ||
      !Number.isFinite(
        Number(target.rotation)
      ) ||
      !Number.isFinite(
        Number(target.difference)
      )
    ) {
      return null;
    }

    return {
      rotation:
        Number(target.rotation),
      difference:
        Math.abs(
          Number(target.difference)
        )
    };
  }

  attachProtractorToCenterTarget() {
    if (
      !this.protractorState ||
      !this.protractorSnapOptions
    ) {
      return;
    }

    this.protractorState.update({
      x:
        this.protractorSnapOptions
          .centerTarget.x,
      y:
        this.protractorSnapOptions
          .centerTarget.y,
      centerLocked: true
    });
  }

  appendProtractorLabel({
    group,
    svgNamespace,
    degrees,
    value,
    radius,
    className
  }) {
    const radians =
      degrees * Math.PI / 180;
    const label =
      document.createElementNS(
        svgNamespace,
        "text"
      );

    label.setAttribute(
      "x",
      radius * Math.cos(radians)
    );
    label.setAttribute(
      "y",
      -radius * Math.sin(radians)
    );
    label.setAttribute(
      "class",
      className
    );
    label.setAttribute(
      "text-anchor",
      "middle"
    );
    label.setAttribute(
      "dominant-baseline",
      "middle"
    );
    label.textContent = value;
    group.appendChild(label);
  }

  updateProtractor(changes = null) {
    if (
      !this.protractorElement ||
      !this.protractorState
    ) {
      return null;
    }

    if (changes) {
      this.protractorState.update(
        changes
      );
    }

    const group =
      this.protractorElement
        .querySelector(
          ".geometry-protractor-content"
        );

    if (group) {
      group.setAttribute(
        "transform",
        `translate(${this.protractorState.x} ${this.protractorState.y}) rotate(${this.protractorState.rotation})`
      );

      group.classList.toggle(
        "is-center-locked",
        this.protractorState
          .centerLocked === true
      );
      group.classList.toggle(
        "is-baseline-locked",
        this.protractorState
          .baselineLocked === true
      );
    }

    this.protractorElement.hidden =
      !this.protractorState.visible;

    return this.protractorState;
  }

  emitProtractorChange(
    changeType = null
  ) {
    if (
      typeof this.protractorChangeHandler ===
      "function"
    ) {
      this.protractorChangeHandler(
        this.protractorState.toJSON(),
        {
          type: changeType
        }
      );
    }
  }

  getCanvasBounds() {
    return {
      width:
        this.element
          ? this.element.clientWidth
          : this.width,
      height:
        this.element
          ? this.element.clientHeight
          : this.height
    };
  }

  clamp(value, minimum, maximum) {
    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );
  }

  removeProtractor() {
    if (
      this.protractorElement
    ) {
      const group =
        this.protractorElement
          .querySelector(
            ".geometry-protractor-content"
          );

      if (
        group &&
        this.boundProtractorPointerDown
      ) {
        group.removeEventListener(
          "pointerdown",
          this.boundProtractorPointerDown
        );
      }

      this.protractorElement.remove();
    }

    if (
      this.element &&
      this.boundProtractorPointerMove
    ) {
      this.element.removeEventListener(
        "pointermove",
        this.boundProtractorPointerMove
      );
      this.element.removeEventListener(
        "pointerup",
        this.boundProtractorPointerUp
      );
      this.element.removeEventListener(
        "pointercancel",
        this.boundProtractorPointerUp
      );
    }

    this.protractorElement = null;
    this.protractorState = null;
    this.protractorChangeHandler = null;
    this.protractorSnapOptions = null;
    this.protractorInteraction = null;
    this.boundProtractorPointerDown =
      null;
    this.boundProtractorPointerMove =
      null;
    this.boundProtractorPointerUp =
      null;
  }

  getRayBoundaryPoint({
    startX,
    startY,
    directionX,
    directionY
  }) {
    const magnitude =
      Math.hypot(
        directionX,
        directionY
      );

    if (magnitude < 1) {
      return null;
    }

    const elementWidth =
      this.element
        ? this.element.clientWidth
        : this.width;

    const elementHeight =
      this.element
        ? this.element.clientHeight
        : this.height;

    const candidates = [];

    if (directionX > 0) {
      candidates.push(
        (elementWidth -
          startX) /
        directionX
      );
    }

    if (directionX < 0) {
      candidates.push(
        (0 - startX) /
        directionX
      );
    }

    if (directionY > 0) {
      candidates.push(
        (elementHeight -
          startY) /
        directionY
      );
    }

    if (directionY < 0) {
      candidates.push(
        (0 - startY) /
        directionY
      );
    }

    const validScales =
      candidates.filter(
        (scale) =>
          Number.isFinite(
            scale
          ) &&
          scale > 0
      );

    if (
      validScales.length === 0
    ) {
      return null;
    }

    const scale =
      Math.min(
        ...validScales
      );

    return {
      x:
        startX +
        directionX *
        scale,

      y:
        startY +
        directionY *
        scale
    };
  }

  removeRayPreview() {
    if (
      this.previewRayElement &&
      this.previewRayElement
        .parentNode
    ) {
      this.previewRayElement
        .parentNode
        .removeChild(
          this.previewRayElement
        );
    }

    this.previewRayElement = null;
  }

  getObject(objectId) {
    const object =
      this.objects.find(
        (currentObject) =>
          currentObject.id ===
          objectId
      );

    return object
      ? {
          ...object
        }
      : null;
  }

  loadObjects(objects = []) {
    this.clear();

    const points =
      objects.filter(
        (object) =>
          object.type === "point"
      );

    const rays =
      objects.filter(
        (object) =>
          object.type === "ray"
      );

    points.forEach(
      (point) => {
        this.addPoint(
          point.x,
          point.y,
          {
            id: point.id,
            label: point.label
          }
        );
      }
    );

    rays.forEach(
      (ray) => {
        this.addRay(
          ray.originPointId,
          ray.endX,
          ray.endY,
          {
            id: ray.id,
            label: ray.label
          }
        );
      }
    );
  }

  getObjects() {
    return this.objects.map(
      (object) => ({
        ...object
      })
    );
  }

  clear() {
    this.objects = [];

    this.removeRayPreview();
    this.removeAngleMarker();
    this.removeProtractor();

    if (this.element) {
      this.element.innerHTML = "";
    }
  }

  destroy() {
    this.disablePointCreation();
    this.disableRayCreation();
    this.clear();

    this.element = null;
  }
}

window.GeometryCanvas =
  GeometryCanvas;
