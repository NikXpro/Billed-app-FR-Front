/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import Actions from "../views/Actions.js";

describe("Given I am connected as an Employee", () => {
  describe("When I am on Bills page and there are bills", () => {
    test("Then, it should render icon eye", () => {
      const html = Actions();
      document.body.innerHTML = html;
      expect(screen.getByTestId("icon-eye")).toBeTruthy();
    });
  });
  describe("When I am on Bills page and there are bills with url for file", () => {
    test("Then, it should save given url in data-bill-url custom attribute", () => {
      const url = "/fake_url";
      const html = Actions(url);
      document.body.innerHTML = html;
      expect(screen.getByTestId("icon-eye")).toHaveAttribute(
        "data-bill-url",
        url
      );
    });
  });
  describe("When I am on Bills page and there are bills with fileUrl and fileName", () => {
    test("Then, it should save given fileUrl and fileName in custom attributes", () => {
      const fileData = { fileUrl: "/fake_url", fileName: "test.jpg" };
      const html = Actions(fileData);
      document.body.innerHTML = html;
      expect(screen.getByTestId("icon-eye")).toHaveAttribute(
        "data-bill-url",
        fileData.fileUrl
      );
      expect(screen.getByTestId("icon-eye")).toHaveAttribute(
        "data-file-name",
        fileData.fileName
      );
    });
  });
});
