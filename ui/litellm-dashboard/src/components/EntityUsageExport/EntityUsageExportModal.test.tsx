import { LocaleProvider } from "@/contexts/LocaleContext";
import { toast } from "@/lib/toast";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../tests/test-utils";
import userEvent from "@testing-library/user-event";
import EntityUsageExportModal from "./EntityUsageExportModal";

const downloadBlob = vi.fn();

vi.mock("./utils", () => ({
  downloadBlob: (...args: unknown[]) => downloadBlob(...args),
  exportFilename: vi.fn(() => "tag_usage_daily_2025-10-01_2025-10-14.csv"),
}));

describe("EntityUsageExportModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    entityType: "tag" as const,
    onExport: vi.fn().mockResolvedValue(new Blob(["data"])),
    dateRange: { from: new Date("2025-10-01"), to: new Date("2025-10-14") },
    selectedFilters: [],
    customTitle: "Export Tag Usage",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    baseProps.onExport.mockResolvedValue(new Blob(["data"]));
  });

  it("exports through the onExport callback with the selected type and format, then closes", async () => {
    const user = userEvent.setup();

    renderWithProviders(<EntityUsageExportModal {...baseProps} />);

    expect(screen.getByRole("button", { name: /Export CSV/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Export CSV/i }));

    expect(baseProps.onExport).toHaveBeenCalledWith("daily", "csv");
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "tag_usage_daily_2025-10-01_2025-10-14.csv");
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("forwards the export type the user picks", async () => {
    const user = userEvent.setup();

    renderWithProviders(<EntityUsageExportModal {...baseProps} />);

    await user.click(screen.getByRole("radio", { name: /Day-by-day breakdown by tag and key/i }));
    await user.click(screen.getByRole("button", { name: /Export CSV/i }));

    expect(baseProps.onExport).toHaveBeenCalledWith("daily_with_keys", "csv");
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("keeps the modal open and reports the error when onExport rejects", async () => {
    const user = userEvent.setup();
    baseProps.onExport.mockRejectedValueOnce(new Error("export failed"));

    renderWithProviders(<EntityUsageExportModal {...baseProps} />);

    await user.click(screen.getByRole("button", { name: /Export CSV/i }));

    expect(baseProps.onExport).toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
    expect(baseProps.onClose).not.toHaveBeenCalled();
  });
  it("localizes export options and feedback without changing the format or exported content", async () => {
    localStorage.setItem("moma.locale", "zh-CN");
    const success = vi.spyOn(toast, "success");
    try {
      const user = userEvent.setup();
      renderWithProviders(
        <LocaleProvider>
          <EntityUsageExportModal {...baseProps} customTitle={undefined} entityType="team" />
        </LocaleProvider>,
      );
      expect(screen.getByRole("heading", { name: "导出团队用量" })).toBeInTheDocument();
      await user.click(screen.getByRole("radio", { name: /按团队与模型逐日导出/ }));
      await user.click(screen.getByRole("button", { name: "导出 CSV" }));
      expect(baseProps.onExport).toHaveBeenCalledWith("daily_with_models", "csv");
      expect(success).toHaveBeenCalledWith("团队用量已导出为 CSV");
      expect(baseProps.onClose).toHaveBeenCalled();
    } finally {
      success.mockRestore();
      localStorage.removeItem("moma.locale");
    }
  });
});
