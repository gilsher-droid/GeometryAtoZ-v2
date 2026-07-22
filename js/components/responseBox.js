class ResponseBox {
  constructor({
    id,
    label,
    placeholder = "כתוב כאן...",
    value = "",
    buttonText = "שמור תשובה",
    onSave = () => {}
  }) {
    this.id = id;
    this.label = label;
    this.placeholder = placeholder;
    this.value = value;
    this.savedValue = value;
    this.buttonText = buttonText;
    this.onSave = onSave;
  }

  render() {
    const isSaved =
      this.savedValue.trim() !== "" &&
      this.savedValue === this.value;

    return `
      <div class="response-box">

        <label for="${this.id}">
          <strong>${this.label}</strong>
        </label>

        <textarea
          id="${this.id}"
          rows="4"
          placeholder="${this.placeholder}"
        >${this.escape(this.value)}</textarea>

        <div class="response-actions">

          <button
            id="${this.id}-save"
            type="button"
            ${isSaved ? "disabled" : ""}
          >
            ${isSaved ? "✓ התשובה נשמרה" : this.buttonText}
          </button>

          <span
            id="${this.id}-status"
            class="response-status"
          >
            ${isSaved ? "התשובה נשמרה." : ""}
          </span>

        </div>

      </div>
    `;
  }

  attach() {
    const textarea =
      document.getElementById(this.id);

    const button =
      document.getElementById(`${this.id}-save`);

    const status =
      document.getElementById(`${this.id}-status`);

    if (!textarea || !button || !status) {
      return;
    }

    textarea.addEventListener("input", () => {
      this.value = textarea.value;

      if (this.value !== this.savedValue) {
        button.disabled = false;
        button.textContent = this.buttonText;
        status.textContent = "יש שינויים שעדיין לא נשמרו.";
      }
    });

    button.addEventListener("click", () => {
      const value = textarea.value.trim();

      if (!value) {
        status.textContent =
          "כתוב תשובה לפני השמירה.";
        textarea.focus();
        return;
      }

      this.savedValue = value;
      this.value = value;

      button.disabled = true;
      button.textContent = "✓ התשובה נשמרה";

      status.textContent = "התשובה נשמרה.";

      this.onSave(value);
    });
  }

  escape(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

window.ResponseBox = ResponseBox;
