import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "./combobox";

function Example({ multiple = false }: { multiple?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <>
      <button onClick={() => setLocale(locale === "zh-CN" ? "en" : "zh-CN")}>切换语言</button>
      <Combobox items={["model-a", "model-b"]} multiple={multiple}>
        <ComboboxInput aria-label="模型" />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  );
}

describe("Combobox dismiss labels", () => {
  beforeEach(() => localStorage.setItem("moma.locale", "zh-CN"));

  it.each([false, true])("localizes both dismissal controls with multiple=%s", async (multiple) => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Example multiple={multiple} />
      </LocaleProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "模型" }));
    const controls = await screen.findAllByRole("button", { name: "关闭" });
    expect(controls).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    await user.click(controls[multiple ? 1 : 0]);
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "模型" })).toHaveAttribute("aria-expanded", "false"),
    );
    expect(screen.getByRole("combobox", { name: "模型" })).toHaveValue("");
  });

  it("updates an open popup when the interface language changes", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Example />
      </LocaleProvider>,
    );
    const switchLanguage = screen.getByRole("button", { name: "切换语言" });
    await user.click(screen.getByRole("combobox", { name: "模型" }));
    expect(await screen.findAllByRole("button", { name: "关闭" })).toHaveLength(2);
    fireEvent.click(switchLanguage);
    expect(await screen.findAllByRole("button", { name: "Dismiss" })).toHaveLength(2);
    fireEvent.click(switchLanguage);
    expect(await screen.findAllByRole("button", { name: "关闭" })).toHaveLength(2);
    await user.keyboard("{Escape}");
    expect(screen.getByRole("combobox", { name: "模型" })).toHaveAttribute("aria-expanded", "false");
  });
});
