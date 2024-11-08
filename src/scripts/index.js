(function init() {
  const formId = "fronty-proste";
  const ZOOM = "zoom";
  const DELIVERY = "delivery";
  const requiredFieldIds = ["name-surname", "email", "address", "phone", 
    "article", "thickness", "color", DELIVERY, "color-symbol", "zgoda-rodo"];

  function removeWarningOnClick(e) {
    const element = e.target;
    element.classList.remove("required-field-error");
  }

  function getFormData() {
    const form = getFormElement();
    const data = new FormData(form);
    return data;
  }
  
  function getFormEntries(data) {
    const entries = {};
    Array.from(data.entries()).forEach(function(entry) { entries[entry[0]] = entry[1] });
    return entries;
  }

  function getMissingRequiredFieldsList(data) {
    const missingFieldsList = requiredFieldIds.filter(function(entry) {
      return (data.get(entry) === "" || data.get(entry) === null);
    }) || [];
    return missingFieldsList;
  }

  function removeRadiosErrorWarning() {
    const deliveryRadioButtons = document.querySelectorAll("[name=delivery]");
    deliveryRadioButtons.forEach(function(radio) {
      radio.classList.remove("required-field-error");
    });
  }

  function validateForm(data) {
    const missingFieldsList = getMissingRequiredFieldsList(data);
    missingFieldsList.forEach(function(field) {
      if (field === DELIVERY) {
        const deliveryRadioButtons = document.querySelectorAll('[name="' + DELIVERY + '"]');
        deliveryRadioButtons.forEach(function(radio) {
          radio.classList.add("required-field-error");
          radio.addEventListener("click", function() {
            removeRadiosErrorWarning();
          });
        });
      } else {
        const fieldElement = document.querySelector("[name=" + field + "]");
        fieldElement.classList.add("required-field-error");
      }
    });
    return missingFieldsList.length === 0;
  }

  function showModal(id) {
    document.getElementById(id).showModal();
  }

  function closeModal(id) {
    document.getElementById(id).close();
  }

  function printForm(e) {
    e.preventDefault();
    const data = getFormData();
    if (validateForm(data)) {
      window.print();
    } else {
      showModal("invalid-form-warning");
    }
  }

  function submitForm(e) {
    e.preventDefault();
    const data = getFormData();
    if (validateForm(data)) {
      const entries = getFormEntries(data);
      let queriesString = "?";
      for (entry in entries) {
        if (entries[entry] !== "") {
          queriesString += entry + "=" + entries[entry] + "&";
        }
      }
      queriesString = queriesString.replace(/ /g, "%20").replace(/\n/g, "%0A").replace(/\r/g, "%0D");
      const emailAddress = 'zakupy@kobax.pl';
      const subject = "Formularz zamówienia frontów prostych";
      const body = encodeURIComponent(window.location.href + queriesString);
      window.location.href = "mailto:" + emailAddress + "?subject=" + subject + "&body=" + body;
    } else {
      showModal("invalid-form-warning");
    }
  }

  function deselectSameRowCheckbox(checkbox) {
    const row = checkbox.closest("tr");
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(cb) {
      if (cb !== checkbox) {
        cb.checked = false;
      }
    });
  }

  function resetForm() {
    const form = getFormElement();
    form.reset();
    localStorage.removeItem(formId);
    closeModal("reset-form-warning");
  }

  
  function createBottomTable() {

    function appendTableHeader(tableId, addNotes) {
      const headerTemplate = document.getElementById("bottom-table-header");
      const tablesContainer = document.querySelector(".bottom-tables-container");
      const tableHeader = headerTemplate.content.cloneNode(true);
      tableHeader.querySelector(".bottom-table").id = tableId;

      if (addNotes) {
        const warningTextCell = tableHeader.getElementById("warning-text");
        warningTextCell.innerHTML = '<button class="form-button no-print reset-button">WYCZYŚC FORMULARZ</button>';
        warningTextCell.querySelector(".reset-button").addEventListener("click", function(e) {
          e.preventDefault();
          showModal("reset-form-warning")
        });
      }
      tablesContainer.appendChild(tableHeader);
    }
    
    function createTableRows(tableId, startNumber, rowsNumber, addNotes) {
      const rowTemplate = document.getElementById("bottom-table-row");
      const tableBottom = document.querySelector("#" + tableId + " tbody");

      for (let i = startNumber; i < startNumber + rowsNumber; i++) {
        const row = rowTemplate.content.cloneNode(true);
        row.querySelector(".row-number-cell").textContent = i + ".";
        ["height", "width", "quantity", "kind", "display"].forEach(function(name) {
          const cell = row.querySelector("#" + name + "-column");
          cell.id = "row" + i + "-" + name;
          cell.name = "row" + i + "-" + name;
          cell.setAttribute("aria-labelledby", name + "-label");
        });

        const radioVertical = row.querySelector("#vertical-column")
        const radioHorizontal = row.querySelector("#horizontal-column")
        radioVertical.id = "row" + i + "-vertical";
        radioHorizontal.id = "row" + i + "-horizontal";
        radioVertical.name = "row" + i + "-direction";
        radioHorizontal.name = "row" + i + "-direction";

        radioHorizontal.addEventListener("change", function() {deselectSameRowCheckbox(radioHorizontal)});
        radioVertical.addEventListener("change", function() {deselectSameRowCheckbox(radioVertical)});

        tableBottom.appendChild(row);
      }
      if (addNotes) {
        const notesTextareaTemplate = document.getElementById("notes-textarea");
        const notesTextarea = notesTextareaTemplate.content.cloneNode(true);
        tableBottom.appendChild(notesTextarea);
      }
    }

    function createTable(tableId, startNumber, rowsNumber, addNotes) {
      appendTableHeader(tableId, addNotes);
      createTableRows(tableId, startNumber, rowsNumber, addNotes);
    }

    createTable("bottom-table-left", 1, 15, false);
    createTable("bottom-table-right", 16, 5, true);
  }

  function getFormElement() {
    return document.querySelector("#" + formId);
  }

  function switchToLockedForm(form) {
    form.classList.add("locked");
    const warningTextCell = document.querySelectorAll(".text-warning")[1];
    warningTextCell.innerHTML = '<strong class="visible-when-locked text-sm">FORMULARZ ZABLOKOWANY DO EDYCJI</strong>';
    document.querySelectorAll(".pointer-events-none").forEach(function(el) {
      el.classList.remove("pointer-events-none");
    });
  }

  function hideVisibleOnHover() {
    console.log("Hiding visible on hover");
    document.querySelectorAll(".visible-on-hover").forEach(function(el) {
      el.classList.add("hidden");
    });
  }

  function recoverQueryParams() {
    const queries = new URLSearchParams(window.location.search);
    if (queries.size) {
      const form = getFormElement();
      queries.forEach(function(value, key) {
        const element = form.querySelector("[name=" + key + "]");
        if (element) {
          if (element.type === "checkbox") {
            element.checked = true;
          } else {
            element.value = value;
          }
        }
      });
      switchToLockedForm(form);
      hideVisibleOnHover();
    }
  }

  function saveFormInLocalStorage() {
    const data = getFormData();
    const entries = getFormEntries(data);
    const notEmptyEntries = {};
    for (entry in entries) {
      if (entries[entry] !== "") {
        notEmptyEntries[entry] = entries[entry];
      }
    }
    localStorage.setItem(formId, JSON.stringify(notEmptyEntries));
  }

  function checkForDataInLocalStorage() {
    const entries = JSON.parse(localStorage.getItem(formId));
    if (entries) {
      const form = getFormElement();
      for (entry in entries) {
        const element = form.querySelector("[name=" + entry + "]");
        if (element) {
          if (element.type === "checkbox") {
            element.checked = true;
          } else if (element.type === "radio") {
            if (element.value === entries[entry]) {
              element.checked = true;
            }
          } else {
            element.value = entries[entry];
          }
        }
      }
    }
  }

  function addZoomButtons() {
    document.body.style.zoom = localStorage.getItem(ZOOM) || "1";
    document.getElementById("zoom-in").addEventListener("click", function() {
      const zoomLevel = (parseFloat(document.body.style.zoom) + 0.1).toString();
      localStorage.setItem(ZOOM, zoomLevel);
      document.body.style.zoom = zoomLevel;
    });
    document.getElementById("zoom-out").addEventListener("click", function() {
      const zoomLevel = (parseFloat(document.body.style.zoom) - 0.1).toString();
      localStorage.setItem(ZOOM, zoomLevel);
      document.body.style.zoom = zoomLevel;
    });
  }

  // function saveScreenshot() {
  //   const data = getFormData();
  //   if (validateForm(data)) {
  //     document.querySelectorAll(".form-button").forEach(function(button) {
  //       button.classList.add("hidden");
  //     });
  //     html2canvas(document.querySelector(".page-a4")).then(function(canvas) {
  //       const imageURL = canvas.toDataURL("image/png");
  //       const a = document.createElement("a");
  //       a.href = imageURL;
  //       a.download = "Formularz.png";
  //       a.click();
  //     }).then(function() {
  //       document.querySelectorAll(".form-button").forEach(function(button) {
  //         button.classList.remove("hidden");
  //       });
  //     });
  //   } else {
  //     showModal("invalid-form-warning");
  //   }
  // };

  function setEventListeners() {
    requiredFieldIds.forEach(function(entry) {
      const element = document.querySelector("[name=" + entry + "]");
      element.addEventListener("click", removeWarningOnClick);
    });
    const printPageButton = document.getElementById("print-page");
    printPageButton.addEventListener("click", printForm);
    // const captureScreenshotButton = document.getElementById("capture");
    // captureScreenshotButton.addEventListener("click", saveScreenshot);
    const sendOrderButton = document.getElementById("send-order");
    sendOrderButton.addEventListener("click", submitForm);
    document.querySelectorAll("dialog").forEach(function(dialog) {
      dialog.addEventListener("click", function() { closeModal(dialog.id) });
    });
    const form = getFormElement();
    form.addEventListener("change", saveFormInLocalStorage);
    const confirmResetFormButton = document.getElementById("confirm-form-reset");
    confirmResetFormButton.addEventListener("click", resetForm);

    addZoomButtons();
  }

  function start() {
    createBottomTable();
    recoverQueryParams();
    checkForDataInLocalStorage();
    setEventListeners();
  }

  start();
})();