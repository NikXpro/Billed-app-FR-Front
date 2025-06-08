import { formatDate } from "../app/format.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import Logout from "./Logout.js";

export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // in jest environment
        if (typeof jest !== "undefined") {
          selectCondition = bill.status === status;
        } else {
          /* istanbul ignore next */
          // in prod environment
          const userEmail = JSON.parse(localStorage.getItem("user")).email;
          selectCondition =
            bill.status === status &&
            ![...USERS_TEST, userEmail].includes(bill.email);
        }

        return selectCondition;
      })
    : [];
};

export const card = (bill) => {
  const firstAndLastNames = bill.email.split("@")[0];
  const firstName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[0]
    : "";
  const lastName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[1]
    : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${
    bill.id
  }'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join("") : "";
};

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    $("#arrow-icon1").click((e) => this.handleShowTickets(e, bills, 1));
    $("#arrow-icon2").click((e) => this.handleShowTickets(e, bills, 2));
    $("#arrow-icon3").click((e) => this.handleShowTickets(e, bills, 3));
    new Logout({ localStorage, onNavigate });
  }

  handleClickIconEye = () => {
    const billUrl = $("#icon-eye-d").attr("data-bill-url");
    const fileName = $("#icon-eye-d").attr("data-file-name");
    const imgWidth = Math.floor($("#modaleFileAdmin1").width() * 0.8);
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
        content = `<div style='text-align: center;'><img width=${imgWidth} src="${billUrl}" alt="Bill"/></div>`;
      } else {
        content = `<div style='color:red;text-align:center;padding:2em'>Fichier justificatif manquant ou au mauvais format</div>`;
      }
    }

    $("#modaleFileAdmin1").find(".modal-body").html(content);
    if (typeof $("#modaleFileAdmin1").modal === "function")
      $("#modaleFileAdmin1").modal("show");
  };

  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0;
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id;
    if (this.counter % 2 === 0) {
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
      $(".dashboard-right-container div").html(DashboardFormUI(bill));
      $(".vertical-navbar").css({ height: "150vh" });
      this.counter++;
    } else {
      $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });

      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $(".vertical-navbar").css({ height: "120vh" });
      this.counter++;
    }
    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "accepted",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill)
      .then(() => {
        this.onNavigate(ROUTES_PATH["Dashboard"]);
      })
      .catch((error) => {
        console.error("Erreur lors de l'acceptation de la note:", error);
      });
  };

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "refused",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill)
      .then(() => {
        this.onNavigate(ROUTES_PATH["Dashboard"]);
      })
      .catch((error) => {
        console.error("Erreur lors du refus de la note:", error);
      });
  };

  handleShowTickets(e, bills, index) {
    if (!this.counters) this.counters = {};

    if (this.counters[index] === undefined) this.counters[index] = 0;

    if (this.counters[index] % 2 === 0) {
      $(`#arrow-icon${index}`).css({ transform: "rotate(0deg)" });
      $(`#status-bills-container${index}`).html(
        cards(filteredBills(bills, getStatus(index)))
      );
    } else {
      $(`#arrow-icon${index}`).css({ transform: "rotate(90deg)" });
      $(`#status-bills-container${index}`).html("");
    }

    this.counters[index]++;

    filteredBills(bills, getStatus(index)).forEach((bill) => {
      $(`#open-bill${bill.id}`).click((e) =>
        this.handleEditTicket(e, bill, bills)
      );
    });

    return bills;
  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => ({
            id: doc.id,
            ...doc,
            date: doc.date,
            status: doc.status,
          }));
          return bills;
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then((bill) => bill)
        .catch(console.log);
    }
    return Promise.resolve();
  };
}
