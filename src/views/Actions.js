import eyeBlueIcon from "../assets/svg/eye_blue.js";

export default (fileData) => {
  // Support pour l'ancien format (rétrocompatibilité) et le nouveau format
  const billUrl =
    fileData && typeof fileData === "string"
      ? fileData
      : fileData?.fileUrl || "";
  const fileName =
    fileData && typeof fileData === "object" ? fileData.fileName : null;

  return `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl} data-file-name="${
    fileName || ""
  }">
      ${eyeBlueIcon}
      </div>
    </div>`;
};
