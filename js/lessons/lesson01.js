function createLesson01() {
  return {
  id: "lesson-01",

  title:
    i18n.t("lesson.title"),

  subtitle:
    i18n.t("lesson.subtitle"),

  thinkingKey:
    i18n.t("lesson.thinkingKey"),

  steps: [
    {
      id: "welcome",
      type: "welcome",
      title:
        i18n.t(
          "lesson.welcome.title"
        ),
      text:
        i18n.t(
          "lesson.welcome.text"
        ),
      actionLabel:
        i18n.t("welcome.start")
    },

    {
      id: "shapes-question",
      type: "question",
      title:
        i18n.t(
          "lesson.shapes.title"
        ),
      text:
        i18n.t(
          "lesson.shapes.text"
        ),
      prompt:
        i18n.t(
          "lesson.shapes.prompt"
        )
    },

    {
      id: "point",
      type: "construction",
      title:
        i18n.t(
          "lesson.point.title"
        ),
      text:
        i18n.t(
          "lesson.point.text"
        ),
      instruction:
        i18n.t(
          "lesson.point.instruction"
        ),
      pointLabel: "A",
      canvasWidth: 640,
      canvasHeight: 360
    },

{
  id: "ray",
  type: "ray-construction",
  title:
    i18n.t("lesson.ray.title"),
  text:
    i18n.t("lesson.ray.text"),
  instruction:
    i18n.t(
      "lesson.ray.instruction"
    ),
  originPointId: "point-A",
  rayId: "ray-1",
  rayLabel: "",
  canvasWidth: 640,
  canvasHeight: 360
},

{
  id: "angle",
  type: "angle-construction",
  title:
    i18n.t("lesson.angle.title"),
  text:
    i18n.t("lesson.angle.text"),
  instruction:
    i18n.t(
      "lesson.angle.instruction"
    ),
  originPointId: "point-A",
  firstRayId: "ray-1",
  secondRayId: "ray-2",
  angleId: "angle-1",
  angleLabel: "",
  angleStepDegrees: 1,
  minimumConstructedAngle: 10,
  maximumConstructedAngle: 170,
  canvasWidth: 640,
  canvasHeight: 360
},

{
  id: "identify-parts",
  type: "question",
  title:
    i18n.t("lesson.parts.title"),
  text:
    i18n.t("lesson.parts.text"),
  prompt:
    i18n.t(
      "lesson.parts.prompt"
    )
},

{
  id: "measure-angle",
  type: "measure-angle",
  title:
    i18n.t(
      "lesson.measure.title"
    ),
  text:
    i18n.t(
      "lesson.measure.text"
    ),
  instruction:
    i18n.t(
      "lesson.measure.instruction"
    ),
  vertexPointId: "point-A",
  baselineRayId: "ray-1",
  firstRayId: "ray-1",
  secondRayId: "ray-2",
  angleId: "angle-1",
  answerToleranceDegrees: 1,
  centerTolerance: 16,
  rotationTolerance: 4,
  centerSnapTolerance: 24,
  centerUnlockTolerance: 32,
  baselineSnapTolerance: 6,
  baselineUnsnapTolerance: 10,
  protractorRadius: 130,
  canvasWidth: 640,
  canvasHeight: 360
},

    {
      id: "classify-angle",
      type: "claim-justification",
      title:
        i18n.t(
          "lesson.classify.title"
        ),
      text:
        i18n.t(
          "lesson.classify.text"
        ),
      claimPrompt:
        i18n.t(
          "lesson.classify.claim"
        ),
      justificationPrompt:
        i18n.t(
          "lesson.classify.justification"
        )
    },

    {
      id: "thinking-key",
      type: "thinking-key",
      title:
        i18n.t(
          "lesson.key.title"
        ),
      text:
        i18n.t(
          "lesson.thinkingKey"
        ),
      reflection:
        i18n.t(
          "lesson.key.reflection"
        )
    },

    {
      id: "summary",
      type: "summary",
      title:
        i18n.t(
          "lesson.summary.title"
        ),
      concepts: [
        i18n.t("concept.point"),
        i18n.t("concept.ray"),
        i18n.t("concept.vertex"),
        i18n.t("concept.angle"),
        i18n.t(
          "concept.measurement"
        ),
        i18n.t("concept.claim"),
        i18n.t(
          "concept.justification"
        )
      ]
    }
  ]
  };
}

let lesson01 =
  createLesson01();

window.lesson01 = lesson01;
window.createLesson01 =
  createLesson01;
