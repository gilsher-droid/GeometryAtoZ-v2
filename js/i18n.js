class I18n {
  constructor({
    defaultLocale = "he",
    storageKey = "geometryatoz.locale",
    messages = {}
  } = {}) {
    this.defaultLocale =
      defaultLocale;
    this.storageKey =
      storageKey;
    this.messages =
      messages;
    this.supportedLocales =
      Object.keys(messages);
    this.locale =
      this.getStoredLocale();

    this.applyDocumentLanguage();
  }

  getStoredLocale() {
    try {
      const storedLocale =
        window.localStorage.getItem(
          this.storageKey
        );

      if (
        this.supportedLocales.includes(
          storedLocale
        )
      ) {
        return storedLocale;
      }
    } catch (error) {
      // The product still works when storage is unavailable.
    }

    return this.defaultLocale;
  }

  setLocale(locale) {
    if (
      !this.supportedLocales.includes(
        locale
      ) ||
      locale === this.locale
    ) {
      return;
    }

    this.locale = locale;

    try {
      window.localStorage.setItem(
        this.storageKey,
        locale
      );
    } catch (error) {
      // Language switching does not depend on persistence.
    }

    this.applyDocumentLanguage();

    window.dispatchEvent(
      new CustomEvent(
        "geometryatoz:localechange",
        {
          detail: {
            locale
          }
        }
      )
    );
  }

  applyDocumentLanguage() {
    document.documentElement.lang =
      this.locale;
    document.documentElement.dir =
      this.locale === "he"
        ? "rtl"
        : "ltr";
  }

  t(key, replacements = {}) {
    const localeMessages =
      this.messages[this.locale] ||
      {};
    const fallbackMessages =
      this.messages[
        this.defaultLocale
      ] || {};
    const template =
      localeMessages[key] ??
      fallbackMessages[key] ??
      key;

    return Object.entries(
      replacements
    ).reduce(
      (
        result,
        [replacementKey, value]
      ) =>
        result.replaceAll(
          `{${replacementKey}}`,
          String(value)
        ),
      template
    );
  }
}

const messages = {
  he: {
    "header.aria":
      "Geometry A to Z מבית Fundamatics",
    "header.subtitle":
      "לומדים לבנות טענות וצידוקים באמצעות גיאומטריה",
    "header.home":
      "חזרה ל־Fundamatics",
    "language.label":
      "בחירת שפה",
    "language.hebrew":
      "עברית",
    "language.english":
      "English",
    "welcome.title":
      "ברוכים הבאים",
    "welcome.text":
      "המסע שלנו בגיאומטריה מתחיל כאן.",
    "welcome.start":
      "מתחילים",
    "app.noStep":
      "לא נמצא שלב להצגה",
    "app.progress":
      "התקדמות: {progress}%",
    "app.step":
      "שלב {current} מתוך {total}",
    "app.reflection":
      "שאלה למחשבה:",
    "app.previous":
      "הקודם",
    "app.next":
      "הבא",
    "app.finish":
      "סיום",
    "app.incomplete":
      "כדי להמשיך, יש להשלים את הפעילות.",
    "app.completeTitle":
      "סיימת את השיעור הראשון",
    "app.completeText":
      "בנית את מפתח החשיבה הראשון:",
    "app.restart":
      "להתחיל מחדש",
    "lesson.title":
      "הכניסה לעולם הגיאומטריה",
    "lesson.subtitle":
      "מנקודה לזווית — ואיך בונים טענה וצידוק",
    "lesson.thinkingKey":
      "גיאומטריה מתחילה מהגדרות.",
    "lesson.welcome.title":
      "ברוכים הבאים לעולם הגיאומטריה",
    "lesson.welcome.text":
      "המסע שלנו מתחיל בשאלה פשוטה: ממה בנויה הגיאומטריה?",
    "lesson.shapes.title":
      "מה משותף לכל הצורות?",
    "lesson.shapes.text":
      "התבונן בריבוע, במלבן, במשולש, בטרפז ובמשושה. מה לדעתך משותף לכולן?",
    "lesson.shapes.prompt":
      "כתוב או אמור את ההשערה שלך.",
    "lesson.point.title":
      "נקודה",
    "lesson.point.text":
      "לחץ במקום כלשהו כדי ליצור נקודה.",
    "lesson.point.instruction":
      "לחץ בתוך המשטח כדי ליצור נקודה.",
    "lesson.ray.title":
      "קרן",
    "lesson.ray.text":
      "קרן מתחילה בנקודה וממשיכה ללא סוף בכיוון אחד.",
    "lesson.ray.instruction":
      "התחל מהנקודה A וגרור לכיוון כלשהו כדי ליצור קרן.",
    "lesson.angle.title":
      "נוצרת זווית",
    "lesson.angle.text":
      "שתי קרניים היוצאות מאותה נקודה יוצרות זווית.",
    "lesson.angle.instruction":
      "גרור מהנקודה A בכיוון חדש כדי ליצור קרן שנייה.",
    "lesson.parts.title":
      "מהם חלקי הזווית?",
    "lesson.parts.text":
      "התבונן בזווית שיצרת. זהה את הקודקוד, את שתי הקרניים ואת האזור שביניהן.",
    "lesson.parts.prompt":
      "כתוב מהו הקודקוד, מהן שתי הקרניים וכיצד הן יוצרות זווית.",
    "lesson.measure.title":
      "מודדים זווית",
    "lesson.measure.text":
      "השתמש במד הזווית כדי למדוד את הזווית שיצרת.",
    "lesson.measure.instruction":
      "מקם את מרכז מד הזווית על הקודקוד, יישר את קו ה־0° עם הקרן הראשונה וקרא את המידה.",
    "lesson.classify.title":
      "איזה סוג זווית זו?",
    "lesson.classify.text":
      "בחר את סוג הזווית ובנה טענה מתאימה.",
    "lesson.classify.claim":
      "הטענה שלי היא:",
    "lesson.classify.justification":
      "הצידוק שלי הוא:",
    "lesson.key.title":
      "מפתח החשיבה הראשון",
    "lesson.key.reflection":
      "למה חשוב להגדיר מושגים לפני שמתחילים להוכיח טענות?",
    "lesson.summary.title":
      "מה למדנו?",
    "concept.point":
      "נקודה",
    "concept.ray":
      "קרן",
    "concept.vertex":
      "קודקוד",
    "concept.angle":
      "זווית",
    "concept.measurement":
      "מדידת זווית",
    "concept.claim":
      "טענה",
    "concept.justification":
      "צידוק",
    "response.defaultLabel":
      "כתוב את התשובה שלך.",
    "response.defaultPlaceholder":
      "כתוב כאן...",
    "response.answerPlaceholder":
      "כתוב כאן את התשובה שלך...",
    "response.save":
      "שמור תשובה",
    "response.savedButton":
      "✓ התשובה נשמרה",
    "response.saved":
      "התשובה נשמרה.",
    "response.autoSaved":
      "נשמר אוטומטית",
    "response.unsaved":
      "יש שינויים שעדיין לא נשמרו.",
    "response.empty":
      "כתוב תשובה לפני השמירה.",
    "question.thinking":
      "שאלת חשיבה:",
    "claim.prompt":
      "מהי הטענה שלך?",
    "claim.placeholder":
      "כתוב כאן את הטענה שלך...",
    "claim.save":
      "שמור טענה",
    "justification.prompt":
      "כיצד אפשר להצדיק את הטענה?",
    "justification.placeholder":
      "כתוב כאן את הצידוק שלך...",
    "justification.save":
      "שמור צידוק",
    "canvas.aria":
      "משטח גיאומטרי אינטראקטיבי",
    "canvas.protractorAria":
      "מד זווית אינטראקטיבי",
    "construction.point.created":
      "יצרת נקודה. עכשיו אפשר להמשיך.",
    "construction.point.missing":
      "עדיין לא נוצרה נקודה.",
    "construction.ray.created":
      "יצרת קרן. עכשיו אפשר להמשיך.",
    "construction.ray.missing":
      "עדיין לא נוצרה קרן.",
    "construction.originMissing":
      "לא נמצאה נקודת המוצא. חזור לשלב הקודם וצור נקודה.",
    "construction.pointStepMissing":
      "לא נמצאה נקודת המוצא. חזור לשלב הנקודה.",
    "construction.firstRayMissing":
      "לא נמצאה הקרן הראשונה. חזור לשלב הקרן.",
    "construction.angleMissing":
      "עדיין לא נוצרה זווית. צור קרן שנייה מאותה נקודה.",
    "construction.angleRange":
      "בחר זווית בין {minimum}° ל־{maximum}°.",
    "construction.angleCreated":
      "נוצרה זווית בגודל משוער של {degrees}°.",
    "measure.learningMomentAria":
      "העשרה אפשרית",
    "measure.learningMomentButton":
      "צפה בסרטון קצר: כך נראה מד זווית אמיתי",
    "measure.videoTitle":
      "הדגמה של מד זווית פיזי",
    "measure.visualDescriptionLabel":
      "תיאור חזותי:",
    "measure.visualDescription":
      "גיל פותח את המצלמה, מחזיק מד זווית שקוף מול פניו ומקרב אותו למצלמה כדי שיוני יוכל לראות את צורתו ואת הסימונים שעליו.",
    "measure.transcriptLabel":
      "תמלול:",
    "measure.transcript":
      "יוני: \"אה, מכשיר לא, בחיים לא ראיתי.\" גיל: \"וואלה.\" יוני: \"כן.\" גיל: \"עכשיו הכרחת אותי לפתוח את המצלמה, יוני. רק רגע, ידידי היקר, כי לא יכול להיות שאתה לא תכיר את הדבר הזה. רואה את זה? יוני?\" יוני: \"כן.\" גיל: \"זה נקרא מד זווית.\"",
    "measure.noAngle":
      "לא נמצאה זווית למדידה. חזור לשלב יצירת הזווית.",
    "measure.lockControlsAria":
      "בקרי נעילת מד הזווית",
    "measure.answerPrompt":
      "כתוב את גודל הזווית במעלות שלמות.",
    "measure.answerPlaceholder":
      "לדוגמה: 65",
    "measure.check":
      "בדוק תשובה",
    "measure.lockCenter":
      "נעל לקודקוד",
    "measure.unlockCenter":
      "שחרר מהקודקוד",
    "measure.lockBaseline":
      "יישר ונעל לקרן התחתונה",
    "measure.unlockBaseline":
      "שחרר יישור מהקרן",
    "measure.centerReleased":
      "נעילת המרכז שוחררה.",
    "measure.centerLocked":
      "מרכז מד הזווית נעול לקודקוד.",
    "measure.baselineReleased":
      "נעילת קו ה־0° שוחררה.",
    "measure.baselineLocked":
      "קו ה־0° נעול לקרן התחתונה. כעת קרא את הזווית.",
    "measure.baselineTemporarilySnapped":
      "קו ה־0° נצמד זמנית לקרן הראשונה. אפשר לנעול אותו.",
    "measure.positionCenter":
      "מקם את מרכז מד הזווית על קודקוד הזווית.",
    "measure.alignBaseline":
      "סובב את מד הזווית כך שקו ה־0° יהיה מונח על הקרן הראשונה.",
    "measure.alignFirstRay":
      "יישר את קו ה־0° עם הקרן הראשונה.",
    "measure.ready":
      "מד הזווית מוכן לקריאה. בדוק היכן הקרן השנייה פוגשת את הסקלה.",
    "measure.centerTemporarilySnapped":
      "מרכז מד הזווית נצמד זמנית לקודקוד. אפשר לנעול אותו.",
    "measure.enterAnswer":
      "כתוב את גודל הזווית במעלות שלמות.",
    "measure.wrongScale":
      "בדוק מאיזו סקלה צריך להתחיל לקרוא והזן את המידה השלמה.",
    "measure.correct":
      "המדידה נכונה."
  },

  en: {
    "header.aria":
      "Geometry A to Z by Fundamatics",
    "header.subtitle":
      "Learning to build claims and justifications through geometry",
    "header.home":
      "Back to Fundamatics",
    "language.label":
      "Choose language",
    "language.hebrew":
      "עברית",
    "language.english":
      "English",
    "welcome.title":
      "Welcome",
    "welcome.text":
      "Our journey through geometry starts here.",
    "welcome.start":
      "Let’s begin",
    "app.noStep":
      "No lesson step was found",
    "app.progress":
      "Progress: {progress}%",
    "app.step":
      "Step {current} of {total}",
    "app.reflection":
      "A question to consider:",
    "app.previous":
      "Previous",
    "app.next":
      "Next",
    "app.finish":
      "Finish",
    "app.incomplete":
      "Complete the activity before continuing.",
    "app.completeTitle":
      "You completed the first lesson",
    "app.completeText":
      "You built your first thinking key:",
    "app.restart":
      "Start again",
    "lesson.title":
      "Entering the world of geometry",
    "lesson.subtitle":
      "From a point to an angle — and how to build a claim and justification",
    "lesson.thinkingKey":
      "Geometry begins with definitions.",
    "lesson.welcome.title":
      "Welcome to the world of geometry",
    "lesson.welcome.text":
      "Our journey begins with a simple question: what is geometry made of?",
    "lesson.shapes.title":
      "What do all shapes have in common?",
    "lesson.shapes.text":
      "Look at the square, rectangle, triangle, trapezoid, and hexagon. What do you think they have in common?",
    "lesson.shapes.prompt":
      "Write or say your conjecture.",
    "lesson.point.title":
      "Point",
    "lesson.point.text":
      "Click anywhere to create a point.",
    "lesson.point.instruction":
      "Click inside the workspace to create a point.",
    "lesson.ray.title":
      "Ray",
    "lesson.ray.text":
      "A ray begins at a point and continues forever in one direction.",
    "lesson.ray.instruction":
      "Start at point A and drag in any direction to create a ray.",
    "lesson.angle.title":
      "An angle is formed",
    "lesson.angle.text":
      "Two rays that begin at the same point form an angle.",
    "lesson.angle.instruction":
      "Drag from point A in a new direction to create a second ray.",
    "lesson.parts.title":
      "What are the parts of an angle?",
    "lesson.parts.text":
      "Look at the angle you created. Identify the vertex, the two rays, and the region between them.",
    "lesson.parts.prompt":
      "Describe the vertex, the two rays, and how they form an angle.",
    "lesson.measure.title":
      "Measuring an angle",
    "lesson.measure.text":
      "Use the protractor to measure the angle you created.",
    "lesson.measure.instruction":
      "Place the center of the protractor on the vertex, align the 0° line with the first ray, and read the measure.",
    "lesson.classify.title":
      "What type of angle is this?",
    "lesson.classify.text":
      "Choose the type of angle and build an appropriate claim.",
    "lesson.classify.claim":
      "My claim is:",
    "lesson.classify.justification":
      "My justification is:",
    "lesson.key.title":
      "The first thinking key",
    "lesson.key.reflection":
      "Why is it important to define concepts before proving claims?",
    "lesson.summary.title":
      "What did we learn?",
    "concept.point":
      "Point",
    "concept.ray":
      "Ray",
    "concept.vertex":
      "Vertex",
    "concept.angle":
      "Angle",
    "concept.measurement":
      "Measuring angles",
    "concept.claim":
      "Claim",
    "concept.justification":
      "Justification",
    "response.defaultLabel":
      "Write your answer.",
    "response.defaultPlaceholder":
      "Write here...",
    "response.answerPlaceholder":
      "Write your answer here...",
    "response.save":
      "Save answer",
    "response.savedButton":
      "✓ Answer saved",
    "response.saved":
      "Your answer has been saved.",
    "response.autoSaved":
      "Saved automatically",
    "response.unsaved":
      "You have changes that have not been saved.",
    "response.empty":
      "Write an answer before saving.",
    "question.thinking":
      "Thinking question:",
    "claim.prompt":
      "What is your claim?",
    "claim.placeholder":
      "Write your claim here...",
    "claim.save":
      "Save claim",
    "justification.prompt":
      "How can you justify your claim?",
    "justification.placeholder":
      "Write your justification here...",
    "justification.save":
      "Save justification",
    "canvas.aria":
      "Interactive geometry workspace",
    "canvas.protractorAria":
      "Interactive protractor",
    "construction.point.created":
      "You created a point. You can continue.",
    "construction.point.missing":
      "A point has not been created yet.",
    "construction.ray.created":
      "You created a ray. You can continue.",
    "construction.ray.missing":
      "A ray has not been created yet.",
    "construction.originMissing":
      "The starting point was not found. Return to the previous step and create a point.",
    "construction.pointStepMissing":
      "The starting point was not found. Return to the point step.",
    "construction.firstRayMissing":
      "The first ray was not found. Return to the ray step.",
    "construction.angleMissing":
      "An angle has not been created yet. Create a second ray from the same point.",
    "construction.angleRange":
      "Choose an angle between {minimum}° and {maximum}°.",
    "construction.angleCreated":
      "You created an angle of approximately {degrees}°.",
    "measure.learningMomentAria":
      "Optional enrichment",
    "measure.learningMomentButton":
      "Watch a short video: what a real protractor looks like",
    "measure.videoTitle":
      "A demonstration of a physical protractor",
    "measure.visualDescriptionLabel":
      "Visual description:",
    "measure.visualDescription":
      "Gil turns on his camera, holds a transparent protractor in front of his face, and brings it closer to the camera so Yoni can see its shape and markings.",
    "measure.transcriptLabel":
      "English transcript translation:",
    "measure.transcript":
      "Yoni: “Oh, a device? No, I’ve never seen one.” Gil: “Really?” Yoni: “Yes.” Gil: “Now you’ve made me turn on my camera, Yoni. One moment, my dear friend, because you have to know this object. Can you see it, Yoni?” Yoni: “Yes.” Gil: “This is called a protractor.”",
    "measure.noAngle":
      "No angle was found to measure. Return to the angle construction step.",
    "measure.lockControlsAria":
      "Protractor lock controls",
    "measure.answerPrompt":
      "Enter the angle measure as a whole number of degrees.",
    "measure.answerPlaceholder":
      "For example: 65",
    "measure.check":
      "Check answer",
    "measure.lockCenter":
      "Lock to vertex",
    "measure.unlockCenter":
      "Release from vertex",
    "measure.lockBaseline":
      "Align and lock to the first ray",
    "measure.unlockBaseline":
      "Release ray alignment",
    "measure.centerReleased":
      "The center lock has been released.",
    "measure.centerLocked":
      "The center of the protractor is locked to the vertex.",
    "measure.baselineReleased":
      "The 0° line lock has been released.",
    "measure.baselineLocked":
      "The 0° line is locked to the first ray. Now read the angle.",
    "measure.baselineTemporarilySnapped":
      "The 0° line has temporarily snapped to the first ray. You can lock it.",
    "measure.positionCenter":
      "Place the center of the protractor on the angle’s vertex.",
    "measure.alignBaseline":
      "Rotate the protractor until its 0° line lies on the first ray.",
    "measure.alignFirstRay":
      "Align the 0° line with the first ray.",
    "measure.ready":
      "The protractor is ready to read. Find where the second ray meets the scale.",
    "measure.centerTemporarilySnapped":
      "The center of the protractor has temporarily snapped to the vertex. You can lock it.",
    "measure.enterAnswer":
      "Enter the angle measure as a whole number of degrees.",
    "measure.wrongScale":
      "Check which scale starts at 0°, then enter the whole-number measure.",
    "measure.correct":
      "The measurement is correct."
  }
};

window.i18n =
  new I18n({
    messages
  });
