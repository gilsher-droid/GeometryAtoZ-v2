class GeometryCanvas {
  constructor({
    id,
    width = 640,
    height = 360,
    className = "",
    onPointCreated = null
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

    this.element = null;
    this.objects = [];
    this.boundClickHandler = null;
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
    if (!this.element) {
      throw new Error(
        "GeometryCanvas.attach() must be called before enabling interactions."
      );
    }

    this.disablePointCreation();

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
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  setSinglePoint(x, y) {
    this.clear();

    return this.addPoint(
      x,
      y
    );
  }

  addPoint(x, y, options = {}) {
    const point = {
      id:
        options.id ||
        `point-${Date.now()}`,
      type: "point",
      x,
      y,
      label: options.label || ""
    };

    this.objects.push(point);

    this.drawPoint(point);

    return point;
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

  loadObjects(objects = []) {
    this.clear();

    objects.forEach((object) => {
      if (
        object.type === "point"
      ) {
        this.addPoint(
          object.x,
          object.y,
          {
            id: object.id,
            label: object.label
          }
        );
      }
    });
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

    if (this.element) {
      this.element.innerHTML = "";
    }
  }

  destroy() {
    this.disablePointCreation();
    this.clear();
    this.element = null;
  }
}

window.GeometryCanvas =
  GeometryCanvas;
