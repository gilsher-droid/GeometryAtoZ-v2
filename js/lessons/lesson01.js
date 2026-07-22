const lesson01 = {
  id: "lesson-01",

  title: "הכניסה לעולם הגיאומטריה",

  subtitle:
    "מנקודה לזווית — ואיך בונים טענה וצידוק",

  thinkingKey:
    "גיאומטריה מתחילה מהגדרות.",

  steps: [
    {
      id: "welcome",
      type: "welcome",
      title:
        "ברוכים הבאים לעולם הגיאומטריה",
      text:
        "המסע שלנו מתחיל בשאלה פשוטה: ממה בנויה הגיאומטריה?",
      actionLabel: "מתחילים"
    },

    {
      id: "shapes-question",
      type: "question",
      title: "מה משותף לכל הצורות?",
      text:
        "התבונן בריבוע, במלבן, במשולש, בטרפז ובמשושה. מה לדעתך משותף לכולן?",
      prompt:
        "כתוב או אמור את ההשערה שלך."
    },

    {
      id: "point",
      type: "construction",
      title: "נקודה",
      text:
        "לחץ במקום כלשהו כדי ליצור נקודה.",
      instruction:
        "לחץ בתוך המשטח כדי ליצור נקודה.",
      pointLabel: "A",
      canvasWidth: 640,
      canvasHeight: 360
    },

{
  id: "ray",
  type: "ray-construction",
  title: "קרן",
  text:
    "קרן מתחילה בנקודה וממשיכה ללא סוף בכיוון אחד.",
  instruction:
    "התחל מהנקודה A וגרור לכיוון כלשהו כדי ליצור קרן.",
  originPointId: "point-A",
  rayId: "ray-1",
  rayLabel: "",
  canvasWidth: 640,
  canvasHeight: 360
},

{
  id: "angle",
  type: "angle-construction",
  title: "נוצרת זווית",
  text:
    "שתי קרניים היוצאות מאותה נקודה יוצרות זווית.",
  instruction:
    "גרור מהנקודה A בכיוון חדש כדי ליצור קרן שנייה.",
  originPointId: "point-A",
  firstRayId: "ray-1",
  secondRayId: "ray-2",
  angleId: "angle-1",
  angleLabel: "",
  canvasWidth: 640,
  canvasHeight: 360
},

{
  id: "identify-parts",
  type: "question",
  title: "מהם חלקי הזווית?",
  text:
    "התבונן בזווית שיצרת. זהה את הקודקוד, את שתי הקרניים ואת האזור שביניהן.",
  prompt:
    "כתוב מהו הקודקוד, מהן שתי הקרניים וכיצד הן יוצרות זווית."
},

{
  id: "measure-angle",
  type: "measure-angle",
  title: "מודדים זווית",
  text:
    "השתמש במד הזווית כדי למדוד את הזווית שיצרת.",
  instruction:
    "מקם את מרכז מד הזווית על הקודקוד, יישר את קו ה־0° עם הקרן הראשונה וקרא את המידה.",
  vertexPointId: "point-A",
  firstRayId: "ray-1",
  secondRayId: "ray-2",
  angleId: "angle-1",
  tolerance: 1,
  centerTolerance: 16,
  rotationTolerance: 4,
  protractorRadius: 130,
  canvasWidth: 640,
  canvasHeight: 360
},

    {
      id: "classify-angle",
      type: "claim-justification",
      title: "איזה סוג זווית זו?",
      text:
        "בחר את סוג הזווית ובנה טענה מתאימה.",
      claimPrompt:
        "הטענה שלי היא:",
      justificationPrompt:
        "הצידוק שלי הוא:"
    },

    {
      id: "thinking-key",
      type: "thinking-key",
      title: "מפתח החשיבה הראשון",
      text:
        "גיאומטריה מתחילה מהגדרות.",
      reflection:
        "למה חשוב להגדיר מושגים לפני שמתחילים להוכיח טענות?"
    },

    {
      id: "summary",
      type: "summary",
      title: "מה למדנו?",
      concepts: [
        "נקודה",
        "קרן",
        "קודקוד",
        "זווית",
        "מדידת זווית",
        "טענה",
        "צידוק"
      ]
    }
  ]
};

window.lesson01 = lesson01;
