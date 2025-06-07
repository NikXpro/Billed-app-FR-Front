import eyeBlueIcon from "../assets/svg/eye_blue.js";

export default (fileData) => {
  // Support pour l'ancien format (rétrocompatibilité) et le nouveau format
  const billUrl =
    fileData && typeof fileData === "string"
      ? fileData
      : fileData?.fileUrl || "";
  const fileName =
    fileData && typeof fileData === "object" ? fileData.fileName : null;

  // Gérer les cas où billUrl est null, undefined ou 'null'
  const safeUrl =
    billUrl && billUrl !== "null" && billUrl.trim() !== "" ? billUrl : "";

  return `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url="${safeUrl}" data-file-name="${
    fileName || ""
  }">
      ${eyeBlueIcon}
      </div>
    </div>`;
};
