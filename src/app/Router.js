import Bills from "../containers/Bills.js";
import Dashboard from "../containers/Dashboard.js";
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js";
import NewBill from "../containers/NewBill.js";
import store from "./Store.js";

import BillsUI from "../views/BillsUI.js";
import DashboardUI from "../views/DashboardUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

export default () => {
  const rootDiv = document.getElementById("root");
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });

  window.onNavigate = (pathname) => {
    window.history.pushState({}, pathname, window.location.origin + pathname);
    if (pathname === ROUTES_PATH["Login"]) {
      rootDiv.innerHTML = ROUTES({ pathname });
      document.body.style.backgroundColor = "#0E5AE5";
      new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
    } else if (pathname === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.add("active-icon");
      divIcon2.classList.remove("active-icon");
      const bills = new Bills({ document, onNavigate, store, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          const divIcon1 = document.getElementById("layout-icon1");
          const divIcon2 = document.getElementById("layout-icon2");
          divIcon1.classList.add("active-icon");
          divIcon2.classList.remove("active-icon");
          new Bills({ document, onNavigate, store, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    } else if (pathname === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      new NewBill({ document, onNavigate, store, localStorage });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.remove("active-icon");
      divIcon2.classList.add("active-icon");
    } else if (pathname === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const bills = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    }
  };

  window.onpopstate = (e) => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor = "#0E5AE5";
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });
    } else if (user) {
      onNavigate(PREVIOUS_LOCATION);
    }
  };

  // Vérifier si l'utilisateur est déjà connecté au chargement de la page
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const jwt = localStorage.getItem("jwt");

  if (window.location.pathname === "/" && window.location.hash === "") {
    // Si l'utilisateur est connecté, le rediriger vers sa page appropriée
    if (user && jwt) {
      if (user.type === "Employee") {
        onNavigate(ROUTES_PATH["Bills"]);
      } else if (user.type === "Admin") {
        onNavigate(ROUTES_PATH["Dashboard"]);
      }
    } else {
      new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
      document.body.style.backgroundColor = "#0E5AE5";
    }
  } else if (window.location.hash !== "") {
    // Vérifier l'authentification pour les routes protégées
    if (!user || !jwt) {
      // Si pas connecté, rediriger vers login
      onNavigate(ROUTES_PATH["Login"]);
      return null;
    }

    if (window.location.hash === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({
        pathname: window.location.hash,
        loading: true,
      });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.add("active-icon");
      divIcon2.classList.remove("active-icon");
      const bills = new Bills({ document, onNavigate, store, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          const divIcon1 = document.getElementById("layout-icon1");
          const divIcon2 = document.getElementById("layout-icon2");
          divIcon1.classList.add("active-icon");
          divIcon2.classList.remove("active-icon");
          new Bills({ document, onNavigate, store, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
        });
    } else if (window.location.hash === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({
        pathname: window.location.hash,
        loading: true,
      });
      new NewBill({ document, onNavigate, store, localStorage });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.remove("active-icon");
      divIcon2.classList.add("active-icon");
    } else if (window.location.hash === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({
        pathname: window.location.hash,
        loading: true,
      });
      const bills = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
        });
    }
  }

  return null;
};
