"use client";

import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";

import { LiteUiMask } from "@/contexts/LiteUiContext";
import { ROUTING_STATUS_FILTER_ID } from "../utils/routingStatus";

import { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table";
import { Search, Settings, LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { ModelCatalog } from "@/components/ModelCatalog";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/shared/DataTable/DataTablePagination";

import { ModelData } from "@/components/model_dashboard/types";
import {
  DataTable,
  DataTableFilterDrawer,
  DataTableFilterField,
  DataTableToolbar,
} from "@/components/shared/DataTable";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ToolbarSeparator } from "@/components/shared/ToolbarSeparator";
import { cn } from "@/lib/cva.config";

import {
  ACCESS_GROUPS_COLUMN_ID,
  getModelsTableColumns,
  MODEL_NAME_COLUMN_ID,
  STATUS_COLUMN_ID,
} from "./ModelsTableColumns";

export type ModelViewMode = "all" | "current_team";

export const PERSONAL_TEAM_VALUE = "personal";
export const ALL_MODEL_GROUPS_VALUE = "all";
export const WILDCARD_MODEL_GROUP_VALUE = "wildcard";

const MODEL_TABLE_BODY_HEIGHT = 600;
const ALL_PROXY_MODELS_LABEL = "All Proxy Models";

const FILTER_LABELS: Record<string, string> = {
  [MODEL_NAME_COLUMN_ID]: "Public Model Name",
  [ACCESS_GROUPS_COLUMN_ID]: "Model Access Group",
  [ROUTING_STATUS_FILTER_ID]: "Status",
};

const ROUTING_STATUS_FILTER_VALUES = {
  all: "All",
  active: "Active",
  paused: "Paused",
} as const;

const VIEW_MODE_LABELS: Record<ModelViewMode, string> = {
  current_team: "Current Team Models",
  all: ALL_PROXY_MODELS_LABEL,
};

export interface ModelsTableTeamOption {
  value: string;
  label: string;
}

interface AllModelsTableProps {
  initialLayout?: "cards" | "table";
  data: ModelData[];
  rowCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onResetFilters: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  teamOptions: ModelsTableTeamOption[];
  selectedTeamValue: string;
  onTeamChange: (value: string) => void;
  isLoadingTeams: boolean;
  viewMode: ModelViewMode;
  onViewModeChange: (viewMode: ModelViewMode) => void;
  onOpenModelSettings: () => void;
  availableModelGroups: string[];
  availableModelAccessGroups: string[];
  userRole: string;
  userID: string;
  isViewOnly: boolean;
  onModelIdClick: (modelId: string) => void;
  onTeamIdClick: (teamId: string) => void;
  onDeleteClick: (modelId: string) => void;
  onTogglePauseClick: (modelId: string, blocked: boolean) => void | Promise<void>;
  pausingModelId: string | null;
  credentialLabels?: ReadonlyMap<string, string>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-muted">
        <Search className="size-5 text-muted-foreground" />
      </div>
      <div className="text-base font-semibold text-foreground">
        <L>No models found</L>
      </div>
      <div className="max-w-80 text-sm text-muted-foreground">
        <L>No models match your search or filters. Try resetting them.</L>
      </div>
    </div>
  );
}

export function AllModelsTable({
  initialLayout = "table",
  data,
  rowCount,
  isLoading,
  isRefreshing,
  onRefresh,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  columnFilters,
  onColumnFiltersChange,
  onResetFilters,
  searchValue,
  onSearchChange,
  teamOptions,
  selectedTeamValue,
  onTeamChange,
  isLoadingTeams,
  viewMode,
  onViewModeChange,
  onOpenModelSettings,
  availableModelGroups,
  availableModelAccessGroups,
  userRole,
  userID,
  isViewOnly,
  onModelIdClick,
  onTeamIdClick,
  onDeleteClick,
  onTogglePauseClick,
  pausingModelId,
  credentialLabels,
}: AllModelsTableProps) {
  const t = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [requestedLayout, setLayout] = useState<"cards" | "table" | null>(null);
  const layout = requestedLayout ?? initialLayout;

  const columns = useMemo(() => {
    const columnDeps = {
      userRole,
      userID,
      isViewOnly,
      onModelIdClick,
      onTeamIdClick,
      onDeleteClick,
      onTogglePauseClick,
      pausingModelId,
      credentialLabels,
    };
    return getModelsTableColumns(columnDeps);
  }, [
    userRole,
    userID,
    isViewOnly,
    onModelIdClick,
    onTeamIdClick,
    onDeleteClick,
    onTogglePauseClick,
    pausingModelId,
    credentialLabels,
  ]);

  const modelGroupOptions = useMemo(
    () => [
      { label: ALL_PROXY_MODELS_LABEL, value: ALL_MODEL_GROUPS_VALUE },
      { label: "Wildcard Models (*)", value: WILDCARD_MODEL_GROUP_VALUE },
      ...availableModelGroups.map((group) => ({ label: group, value: group })),
    ],
    [availableModelGroups],
  );

  const accessGroupOptions = useMemo(
    () => [
      { label: "All Model Access Groups", value: ALL_MODEL_GROUPS_VALUE },
      ...availableModelAccessGroups.map((accessGroup) => ({ label: accessGroup, value: accessGroup })),
    ],
    [availableModelAccessGroups],
  );

  const formatFilterValue = (columnId: string, value: unknown): string => {
    const raw = String(value);
    if (columnId === MODEL_NAME_COLUMN_ID && raw === WILDCARD_MODEL_GROUP_VALUE) {
      return "Wildcard Models (*)";
    }
    if (columnId === ROUTING_STATUS_FILTER_ID) {
      return ROUTING_STATUS_FILTER_VALUES[raw as keyof typeof ROUTING_STATUS_FILTER_VALUES] ?? raw;
    }
    return raw;
  };

  const selectedTeamLabel =
    teamOptions.find((option) => option.value === selectedTeamValue)?.label ?? teamOptions[0]?.label ?? "";

  const renderCatalog = () => {
    if (isLoading)
      return (
        <p role="status">
          <L>Loading models…</L>
        </p>
      );
    if (data.length === 0) return <EmptyState />;
    return (
      <ModelCatalog
        key={`${userID}:${selectedTeamValue}`}
        models={data}
        teamId={selectedTeamValue === PERSONAL_TEAM_VALUE ? null : selectedTeamValue}
        onModelClick={onModelIdClick}
      />
    );
  };
  if (layout === "cards") {
    return (
      <section>
        <div className="moma-catalog-toolbar">
          <Input
            className="min-w-40 flex-1"
            aria-label="Search model names"
            placeholder="Search model names…"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Select value={selectedTeamValue} onValueChange={(value) => onTeamChange(String(value))}>
            <SelectTrigger aria-label={t("Current team")} className="max-w-52">
              <L>{selectedTeamValue === PERSONAL_TEAM_VALUE ? "Personal" : selectedTeamLabel}</L>
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={isLoadingTeams}>
                  {option.value === PERSONAL_TEAM_VALUE ? <L>Personal</L> : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as ModelViewMode)}>
            <SelectTrigger aria-label={t("Model scope")} className="max-w-56">
              <L>{VIEW_MODE_LABELS[viewMode]}</L>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VIEW_MODE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <L>{label}</L>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <L>Refresh</L>
          </Button>
          <Button variant="outline" onClick={() => void setLayout("table")}>
            <List />
            <L>Table view</L>
          </Button>
        </div>
        {renderCatalog()}
        <DataTablePagination
          page={pagination.pageIndex}
          pageSize={pagination.pageSize}
          rowCount={rowCount}
          onPageChange={(pageIndex) => onPaginationChange({ ...pagination, pageIndex })}
          onPageSizeChange={(pageSize) => onPaginationChange({ pageIndex: 0, pageSize })}
          pageSizeOptions={[10, 25, 50]}
          isLoading={isLoading}
        />
      </section>
    );
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(row, index) => row.model_info?.id ?? String(index)}
      sortingMode="server"
      sorting={sorting}
      onSortingChange={onSortingChange}
      enableSortingRemoval
      paginationMode="server"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      rowCount={rowCount}
      pageSizeOptions={[10, 25, 50]}
      filterMode="server"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      defaultColumnVisibility={{ [STATUS_COLUMN_ID]: false }}
      enableColumnResizing
      maxBodyHeight={MODEL_TABLE_BODY_HEIGHT}
      isLoading={isLoading}
      loadingMessage="Loading models…"
      noDataMessage={<EmptyState />}
      size="compact"
      toolbar={(table) => (
        <>
          <DataTableToolbar
            table={table}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search model names…"
            onOpenFilters={() => setFiltersOpen(true)}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            filterLabels={FILTER_LABELS}
            formatFilterValue={formatFilterValue}
          >
            <Button variant="outline" size="sm" onClick={() => void setLayout("cards")}>
              <LayoutGrid />
              <L>Card view</L>
            </Button>
            <Select value={selectedTeamValue} onValueChange={(value) => onTeamChange(String(value))}>
              <SelectTrigger
                size="sm"
                aria-label="Current team"
                data-testid="models-team-select"
                className="gap-2 bg-secondary"
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    selectedTeamValue === PERSONAL_TEAM_VALUE ? "bg-info" : "bg-success",
                  )}
                />
                <span className="text-muted-foreground">
                  <L>Team</L>
                </span>
                <span className="truncate font-semibold">
                  {selectedTeamValue === PERSONAL_TEAM_VALUE ? <L>Personal</L> : selectedTeamLabel}
                </span>
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={isLoadingTeams}
                    className="[&>div]:min-w-0"
                  >
                    <span data-slot="select-item-label" className="min-w-0 truncate" title={option.label}>
                      {option.value === PERSONAL_TEAM_VALUE ? <L>Personal</L> : option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as ModelViewMode)}>
              <SelectTrigger size="sm" aria-label="View" data-testid="models-view-select" className="gap-2">
                <span className="text-muted-foreground">
                  <L>View</L>
                </span>
                <span className="truncate">
                  <L>{VIEW_MODE_LABELS[viewMode]}</L>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_team">
                  <L>{VIEW_MODE_LABELS.current_team}</L>
                </SelectItem>
                <SelectItem value="all">
                  <L>{VIEW_MODE_LABELS.all}</L>
                </SelectItem>
              </SelectContent>
            </Select>

            <ToolbarSeparator className="mx-0.5" />

            <LiteUiMask adminOnly>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Model Settings"
                title="Model Settings"
                data-testid="models-settings-trigger"
                onClick={onOpenModelSettings}
              >
                <Settings />
              </Button>
            </LiteUiMask>
          </DataTableToolbar>
          <DataTableFilterDrawer
            table={table}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title="Filters"
            description="Narrow down models + endpoints"
            resetLabel="Reset Filters"
            onReset={onResetFilters}
          >
            {({ get, set }) => (
              <>
                <DataTableFilterField label="Public Model Name">
                  <SearchSelect
                    options={modelGroupOptions}
                    value={(get(MODEL_NAME_COLUMN_ID) as string) ?? ALL_MODEL_GROUPS_VALUE}
                    onValueChange={(value) =>
                      set(MODEL_NAME_COLUMN_ID, value === ALL_MODEL_GROUPS_VALUE ? undefined : value ?? undefined)
                    }
                    placeholder="Filter by Public Model Name"
                    emptyText="No models found"
                  />
                </DataTableFilterField>
                <DataTableFilterField label="Status">
                  <Select
                    value={(get(ROUTING_STATUS_FILTER_ID) as string) ?? "all"}
                    onValueChange={(value) =>
                      set(ROUTING_STATUS_FILTER_ID, value === "all" ? undefined : (value as "active" | "paused"))
                    }
                  >
                    <SelectTrigger aria-label="Filter by status" className="w-full">
                      {ROUTING_STATUS_FILTER_VALUES[
                        (get(ROUTING_STATUS_FILTER_ID) as keyof typeof ROUTING_STATUS_FILTER_VALUES) ?? "all"
                      ] ?? ROUTING_STATUS_FILTER_VALUES.all}
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(ROUTING_STATUS_FILTER_VALUES) as Array<keyof typeof ROUTING_STATUS_FILTER_VALUES>
                      ).map((value) => (
                        <SelectItem key={value} value={value}>
                          {ROUTING_STATUS_FILTER_VALUES[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DataTableFilterField>
                <DataTableFilterField label="Model Access Group">
                  <SearchSelect
                    options={accessGroupOptions}
                    value={(get(ACCESS_GROUPS_COLUMN_ID) as string) ?? ALL_MODEL_GROUPS_VALUE}
                    onValueChange={(value) =>
                      set(ACCESS_GROUPS_COLUMN_ID, value === ALL_MODEL_GROUPS_VALUE ? undefined : value ?? undefined)
                    }
                    placeholder="Filter by Model Access Group"
                    emptyText="No model access groups found"
                  />
                </DataTableFilterField>
              </>
            )}
          </DataTableFilterDrawer>
        </>
      )}
    />
  );
}
