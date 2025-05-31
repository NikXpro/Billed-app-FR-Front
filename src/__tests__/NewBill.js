/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import { ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "test@test.com" })
    );
  });

  describe("When I am on NewBill Page", () => {
    test("Then it should render NewBill form", () => {
      // Given
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Then
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    test("Then it should display an error message if file extension is invalid", () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const fileInput = screen.getByTestId("file");
      // When
      const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.pdf",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);
      // Then
      expect(document.querySelector("#file-error-message").textContent).toBe(
        "Seuls les fichiers jpg, jpeg et png sont acceptés."
      );
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    });

    test("Then it should accept a valid file and clear error message", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const fileInput = screen.getByTestId("file");
      // When
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);
      // Then
      await waitFor(() => {
        expect(document.querySelector("#file-error-message").textContent).toBe(
          ""
        );
      });
      await waitFor(() => {
        expect(newBill.fileName).toBe("test.png");
        expect(newBill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
      });
    });

    test("Then it should log error if store.bills().create fails", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const errorStore = {
        bills: () => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur API"))),
        }),
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: errorStore,
        localStorage: window.localStorage,
      });
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const fileInput = screen.getByTestId("file");
      // When
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);
      // Then
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });
      consoleSpy.mockRestore();
    });

    test("Then it should submit the form and call updateBill, then navigate to Bills", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Simuler d'abord un fichier valide pour avoir des données complètes
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);

      // Attendre que le fichier soit traité
      await waitFor(() => {
        expect(newBill.fileName).toBe("test.png");
      });

      // Remplir les champs du formulaire
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Taxi" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "42" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2023-01-01" },
      });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "10" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Test" },
      });

      // When
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      // Then
      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });

    test("Then it should handle file change when no files are selected", () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // When
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "",
          files: [],
        },
      };
      newBill.handleChangeFile(mockEvent);
      // Then
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    });

    test("Then it should accept jpg files", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // When
      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.jpg",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);
      // Then
      await waitFor(() => {
        expect(document.querySelector("#file-error-message").textContent).toBe(
          ""
        );
        expect(newBill.fileName).toBe("test.jpg");
      });
    });

    test("Then it should accept jpeg files", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // When
      const file = new File(["dummy"], "test.jpeg", { type: "image/jpeg" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.jpeg",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);
      // Then
      await waitFor(() => {
        expect(document.querySelector("#file-error-message").textContent).toBe(
          ""
        );
        expect(newBill.fileName).toBe("test.jpeg");
      });
    });

    test("Then it should handle form submission when pct field is empty", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Simuler un fichier valide
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);

      await waitFor(() => {
        expect(newBill.fileName).toBe("test.png");
      });

      // Remplir les champs obligatoires sans le pct
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Taxi" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "42" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2023-01-01" },
      });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "10" } });
      // Laisser pct vide
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "" } });

      // When
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Then
      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });

    test("Then updateBill should handle store error gracefully", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const errorStore = {
        bills: () => ({
          create: jest.fn(() =>
            Promise.resolve({ fileUrl: "test.jpg", key: "123" })
          ),
          update: jest.fn(() => Promise.reject(new Error("Update failed"))),
        }),
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: errorStore,
        localStorage: window.localStorage,
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // When
      const bill = {
        email: "test@test.com",
        type: "Transports",
        name: "Taxi",
        amount: 42,
        date: "2023-01-01",
        vat: "10",
        pct: 20,
        commentary: "Test",
        fileUrl: "test.jpg",
        fileName: "test.png",
        status: "pending",
      };
      newBill.updateBill(bill);

      // Then
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });
      consoleSpy.mockRestore();
    });
  });

  // Tests d'intégration
  describe("When I post a new bill", () => {
    test("Then it should create a new bill via mock API POST", async () => {
      // Given
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Simuler un fichier valide
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);

      // Attendre que le fichier soit traité
      await waitFor(() => {
        expect(newBill.fileName).toBe("test.png");
      });

      // Remplir le formulaire
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Vol Paris Londres" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "348" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2004-04-04" },
      });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Business trip to London" },
      });

      // When
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Then
      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });

    test("Then it should handle API error when posting new bill", async () => {
      // Given
      const errorStore = {
        bills: () => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
          update: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
        }),
      };

      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: errorStore,
        localStorage: window.localStorage,
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // When
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);

      // Then
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test("Then it should handle API error 500", async () => {
      // Given
      const errorStore = {
        bills: () => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
          update: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
        }),
      };

      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: errorStore,
        localStorage: window.localStorage,
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // When
      const file = new File(["dummy"], "test.png", { type: "image/png" });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
          files: [file],
        },
      };
      newBill.handleChangeFile(mockEvent);

      // Then
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});
