class ResponseBox {
  constructor({
    id,
    label,
    placeholder =
      i18n.t(
        "response.defaultPlaceholder"
      ),
    value = "",
    buttonText =
      i18n.t("response.save"),
    showSaveButton = true,
    onSave = () => {},
    onChange = () => {}
  }) {
    this.id = id;
    this.label = label;
    this.placeholder = placeholder;
    this.value = value;
    this.savedValue = value;

    this.buttonText = buttonText;
    this.showSaveButton = showSaveButton;

    this.onSave = onSave;
    this.onChange = onChange;
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

        ${
          this.showSaveButton
            ? `
              <div class="response-actions">

                <button
                  id="${this.id}-save"
                  type="button"
                  ${isSaved ? "disabled" : ""}
                >
                  ${
                    isSaved
                      ? i18n.t(
                          "response.savedButton"
                        )
                      : this.buttonText
                  }
                </button>

                <span
                  id="${this.id}-status"
                  class="response-status"
                >
                  ${
                    isSaved
                      ? i18n.t(
                          "response.saved"
                        )
                      : ""
                  }
                </span>

              </div>
            `
            : `
              <div class="response-actions">

                <span
                  id="${this.id}-status"
                  class="response-status"
                >
                </span>

              </div>
            `
        }

      </div>
    `;
  }

  attach() {
    const textarea =
      document.getElementById(
        this.id
      );

    const button =
      document.getElementById(
        `${this.id}-save`
      );

    const status =
      document.getElementById(
        `${this.id}-status`
      );

    if (!textarea || !status) {
      return;
    }

    textarea.addEventListener(
      "input",
      () => {
        this.value =
          textarea.value;

        this.onChange(
          this.value
        );

        if (!this.showSaveButton) {
          status.textContent =
            i18n.t(
              "response.autoSaved"
            );

          return;
        }

        if (
          this.value !==
          this.savedValue
        ) {
          button.disabled =
            false;

          button.textContent =
            this.buttonText;

          status.textContent =
            i18n.t(
              "response.unsaved"
            );
        }
      }
    );

    if (
      !this.showSaveButton
    ) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        const value =
          textarea.value.trim();

        if (!value) {
          status.textContent =
            i18n.t(
              "response.empty"
            );

          textarea.focus();

          return;
        }

        this.savedValue =
          value;

        this.value =
          value;

        button.disabled =
          true;

        button.textContent =
          i18n.t(
            "response.savedButton"
          );

        status.textContent =
          i18n.t(
            "response.saved"
          );

        this.onSave(
          value
        );
      }
    );
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

window.ResponseBox =
  ResponseBox;
