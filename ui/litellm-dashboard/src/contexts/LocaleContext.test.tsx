import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FormField } from "@/components/shared/form/FormField";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { LocaleProvider, LocalizedText, ParameterLabel } from "./LocaleContext";

function KeyForm({ onSubmit }: { onSubmit: (values: { key_alias: string }) => void }) {
  const form = useForm({ defaultValues: { key_alias: "" } });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField control={form.control} name="key_alias" label="Key Alias">
        {(field) => <Input {...field} placeholder="Key Name" />}
      </FormField>
      <button type="submit">
        <LocalizedText>Save</LocalizedText>
      </button>
    </form>
  );
}

afterEach(() => localStorage.clear());

describe("LocaleProvider", () => {
  it("shows the original parameter name once for translated and rich labels", () => {
    localStorage.setItem("moma.locale", "zh-CN");
    render(
      <LocaleProvider>
        <label>
          <ParameterLabel name="SMTP_HOST">
            <LocalizedText>SMTP_HOST</LocalizedText>
          </ParameterLabel>
        </label>
        <label>
          <ParameterLabel name="team_alias">
            <LocalizedText>Team Name</LocalizedText>
          </ParameterLabel>
        </label>
      </LocaleProvider>,
    );
    expect(screen.getByText("邮件服务器地址（SMTP_HOST）")).toHaveTextContent(/^邮件服务器地址（SMTP_HOST）$/);
    expect(screen.getByText("团队名称")).toHaveTextContent("团队名称（team_alias）");
  });

  it("changes UI copy without resetting a form or translating its submitted data", async () => {
    const submit = vi.fn();
    render(
      <LocaleProvider>
        <LanguageSwitcher />
        <KeyForm onSubmit={submit} />
      </LocaleProvider>,
    );
    fireEvent.change(screen.getByLabelText("密钥别名（key_alias）"), { target: { value: "Home" } });
    fireEvent.click(screen.getByRole("button", { name: "语言" }));
    expect(screen.getByLabelText("Key Alias")).toHaveValue("Home");
    expect(screen.getByPlaceholderText("Key Name")).toBeVisible();
    expect(localStorage.getItem("moma.locale")).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ key_alias: "Home" }, expect.anything()));
    fireEvent.click(screen.getByRole("button", { name: "Language" }));
    expect(screen.getByLabelText("密钥别名（key_alias）")).toHaveValue("Home");
    expect(document.documentElement.lang).toBe("zh-CN");
  });

  it("restores only a supported saved language", () => {
    localStorage.setItem("moma.locale", "en");
    const first = render(
      <LocaleProvider>
        <LocalizedText>Home</LocalizedText>
      </LocaleProvider>,
    );
    expect(screen.getByText("Home")).toBeVisible();
    first.unmount();
    localStorage.setItem("moma.locale", "unsupported");
    render(
      <LocaleProvider>
        <LocalizedText>Home</LocalizedText>
      </LocaleProvider>,
    );
    expect(screen.getByText("首页")).toBeVisible();
  });
});
