import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { LiteUiContext } from "./LiteUiContext";
import {
  MountedFormField,
  MountedFormProvider,
  projectMountedValues,
  useMountRegistry,
  type MountedFormValues,
} from "@/components/common_components/MountedFormField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, DataTableToolbar } from "@/components/shared/DataTable";

function SavedFields({ onSave }: { onSave: (values: MountedFormValues) => void }) {
  const form = useForm<MountedFormValues>({
    defaultValues: { key_alias: "editor", tags: "existing-tag", team_id: "" },
  });
  const registry = useMountRegistry();
  return (
    <MountedFormProvider value={{ control: form.control, registry }}>
      <form onSubmit={form.handleSubmit(() => onSave(projectMountedValues(registry, form.getValues)))}>
        <MountedFormField name="key_alias" label="Key Name">
          {({ value, ...props }) => <input {...props} value={String(value)} />}
        </MountedFormField>
        <MountedFormField name="tags" label="Tags">
          {({ value, ...props }) => <input {...props} value={String(value)} />}
        </MountedFormField>
        <MountedFormField name="team_id" label="Required Team" required rules={{ required: "Choose a team" }}>
          {({ value, ...props }) => <input {...props} value={String(value)} />}
        </MountedFormField>
        <button type="submit">Save</button>
      </form>
    </MountedFormProvider>
  );
}

describe("lightweight UI rendering", () => {
  it("keeps hidden stored values in submission and leaves required controls accessible", async () => {
    const onSave = vi.fn();
    render(
      <LiteUiContext.Provider value={{ route: "api-keys", admin: false }}>
        <SavedFields onSave={onSave} />
      </LiteUiContext.Provider>,
    );
    expect(screen.getByLabelText("Tags")).not.toBeVisible();
    expect(screen.getByRole("textbox", { name: "Required Team" })).toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "Key Name" }), { target: { value: "renamed" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Required Team" }), { target: { value: "assigned-team" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ key_alias: "renamed", tags: "existing-tag", team_id: "assigned-team" }),
    );
  });

  it("does not render a blocked tab panel even when its value is selected", () => {
    render(
      <LiteUiContext.Provider value={{ route: "playground", admin: true }}>
        <Tabs value="compare">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>
          <TabsContent value="compare">Comparison controls</TabsContent>
        </Tabs>
      </LiteUiContext.Provider>,
    );
    expect(screen.getByRole("tab", { name: "Chat" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: "Compare" })).not.toBeInTheDocument();
    expect(screen.queryByText("Comparison controls")).not.toBeInTheDocument();
  });

  it("removes blocked columns from the table and the column selector", () => {
    render(
      <LiteUiContext.Provider value={{ route: "api-keys", admin: false }}>
        <DataTable
          data={[{ key_alias: "editor", team_alias: "private-team", user: "other-user" }]}
          columns={[
            { accessorKey: "key_alias", header: "Key" },
            { accessorKey: "team_alias", header: "Team" },
            { accessorKey: "user", header: "User" },
          ]}
          toolbar={(table) => <DataTableToolbar table={table} />}
        />
      </LiteUiContext.Provider>,
    );
    expect(screen.getByRole("columnheader", { name: "Key" })).toBeVisible();
    expect(screen.queryByRole("columnheader", { name: "Team" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("view-options-trigger"));
    expect(screen.queryByRole("menuitemcheckbox", { name: "team_alias" })).not.toBeInTheDocument();
    expect(screen.queryByText("private-team")).not.toBeInTheDocument();
  });
});
