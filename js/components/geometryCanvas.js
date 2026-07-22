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
