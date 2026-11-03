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
import { ModelMaxBudgetField } from "@/components/key_team_helpers/ModelMaxBudgetEditor";

function SavedFields({ onSave }: { onSave: (values: MountedFormValues) => void }) {
  const form = useForm<MountedFormValues>({
    defaultValues: { key_alias: "editor", tags: "existing-tag", team_id: "", project_id: "existing-project" },
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
        <MountedFormField name="team_id" label="Team">
          {({ value, ...props }) => <input {...props} value={String(value)} />}
        </MountedFormField>
        <MountedFormField name="project_id" label="Project">
          {({ value, ...props }) => <input {...props} value={String(value)} />}
        </MountedFormField>
        <button type="submit">Save</button>
      </form>
    </MountedFormProvider>
  );
}

describe("lightweight UI rendering", () => {
  it.each([false, true])("masks per-model budget controls regardless of license status %s", (premiumUser) => {
    const onChange = vi.fn();
    render(
      <LiteUiContext.Provider value={{ route: "teams", admin: true }}>
        <ModelMaxBudgetField
          hint="Per-model spending cap"
          premiumUser={premiumUser}
          value={{ "preview-text": { budget_limit: 5, time_period: "1d" } }}
          availableModels={["preview-text"]}
          onChange={onChange}
        />
      </LiteUiContext.Provider>,
    );
    expect(screen.getByText("Per-Model Budgets")).not.toBeVisible();
    expect(screen.queryByRole("button", { name: "Add Model Budget" })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps hidden stored values in submission and restores optional team assignment", async () => {
    const onSave = vi.fn();
    render(
      <LiteUiContext.Provider value={{ route: "api-keys", admin: false }}>
        <SavedFields onSave={onSave} />
      </LiteUiContext.Provider>,
    );
    expect(screen.getByLabelText("Tags")).not.toBeVisible();
    expect(screen.getByLabelText("Project")).not.toBeVisible();
    expect(screen.getByRole("textbox", { name: "Team" })).toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "Key Name" }), { target: { value: "renamed" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Team" }), { target: { value: "assigned-team" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        key_alias: "renamed",
        tags: "existing-tag",
        team_id: "assigned-team",
        project_id: "existing-project",
      }),
    );
  });

  it("does not render a blocked tab panel even when its value is selected", () => {
    render(
      <LiteUiContext.Provider value={{ route: "logs", admin: true }}>
        <Tabs value="audit logs">
          <TabsList>
            <TabsTrigger value="request logs">Request Logs</TabsTrigger>
            <TabsTrigger value="audit logs">Audit Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="audit logs" keepMounted>
            Enterprise audit preview
          </TabsContent>
        </Tabs>
      </LiteUiContext.Provider>,
    );
    expect(screen.getByRole("tab", { name: "Request Logs" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: "Audit Logs" })).not.toBeInTheDocument();
    expect(screen.queryByText("Enterprise audit preview")).not.toBeInTheDocument();
  });

  it("keeps Teams alert settings hidden even when selected, preserving email alerts", () => {
    render(
      <LiteUiContext.Provider value={{ route: "logging-and-alerts", admin: true }}>
        <Tabs value="ms-teams-alerts">
          <TabsList>
            <TabsTrigger value="email-alerts">Email Alerts</TabsTrigger>
            <TabsTrigger value="ms-teams-alerts">MS Teams Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="ms-teams-alerts" keepMounted>
            Microsoft Teams Alerting Settings
          </TabsContent>
        </Tabs>
      </LiteUiContext.Provider>,
    );
    expect(screen.getByRole("tab", { name: "Email Alerts" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: "MS Teams Alerts" })).not.toBeInTheDocument();
    expect(screen.queryByText("Microsoft Teams Alerting Settings")).not.toBeInTheDocument();
  });

  it.each(["mcp-servers", "mcp", "agents", "skills"])("keeps access group tab %s hidden even when selected", (tab) => {
    render(
      <LiteUiContext.Provider value={{ route: "access-groups", admin: true }}>
        <Tabs value={tab}>
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value={tab}>Hidden resource</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} keepMounted>
            Hidden resource configuration
          </TabsContent>
        </Tabs>
      </LiteUiContext.Provider>,
    );
    expect(screen.getByRole("tab", { name: "Models" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: "Hidden resource" })).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden resource configuration")).not.toBeInTheDocument();
  });

  it("restores team columns while keeping masked columns out of the table and column selector", async () => {
    render(
      <LiteUiContext.Provider value={{ route: "api-keys", admin: false }}>
        <DataTable
          data={[{ key_alias: "editor", team_alias: "assigned-team", user: "other-user" }]}
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
    expect(screen.getByRole("columnheader", { name: "Team" })).toBeVisible();
    expect(screen.queryByRole("columnheader", { name: "User" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("view-options-trigger"));
    expect(await screen.findByRole("menuitemcheckbox", { name: "Team" })).toBeVisible();
    expect(screen.queryByText("other-user")).not.toBeInTheDocument();
  });
});
