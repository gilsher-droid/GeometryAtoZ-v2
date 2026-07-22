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
      type: "interactive",
      title: "נוצרת זווית",
      text:
        "צור קרן נוספת מאותה נקודה. מה נוצר בין שתי הקרניים?",
      interaction: "createAngle"
    },

    {
      id: "identify-parts",
      type: "question",
      title: "מהם חלקי הזווית?",
      text:
        "סמן את הקודקוד, את שתי הקרניים ואת הזווית.",
      prompt:
        "איך אתה יודע שכל רכיב הוא מה שסימנת?"
    },

    {
      id: "measure-angle",
      type: "interactive",
      title: "מודדים זווית",
      text:
        "השתמש במד הזווית כדי למדוד את הזווית שיצרת.",
      interaction: "measureAngle"
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
