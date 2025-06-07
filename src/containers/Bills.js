import { formatDate, formatStatus } from "../app/format.js";
import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const fileName = icon.getAttribute("data-file-name");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    const allowedExtensions = ["jpg", "jpeg", "png"];

    let content;

    // Vérifier si l'URL existe et n'est pas vide (gérer aussi le cas 'null')
    if (!billUrl || billUrl.trim() === "" || billUrl === "null") {
      content = `<div style='color:red;text-align:center;padding:2em'>Fichier justificatif manquant ou au mauvais format</div>`;
    } else {
      // Utiliser le fileName pour valider l'extension au lieu de l'URL hashée
      let isValidFile = false;

      if (fileName && fileName.trim() !== "" && fileName !== "null") {
        const extension = fileName.split(".").pop().toLowerCase();
        isValidFile = allowedExtensions.includes(extension);
      }

      if (isValidFile) {
        content = `<div style='text-align: center;' class="bill-proof-container"><img width="100%" src="${billUrl}" alt="Bill" /></div>`;
      } else {
        content = `<div style='color:red;text-align:center;padding:2em'>Fichier justificatif manquant ou au mauvais format</div>`;
      }
    }

    $("#modaleFile").find(".modal-body").html(content);
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status),
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e, "for", doc);
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            }
          });
          console.log("length", bills.length);
          return bills;
        });
    }
  };
}
