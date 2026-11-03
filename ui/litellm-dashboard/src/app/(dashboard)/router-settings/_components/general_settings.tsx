import { LocalizedText as L } from "@/contexts/LocaleContext";
import { PageHeader, PageHeaderTitle } from "@/components/shared/PageHeader";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGeneralSettingsCall, updateConfigFieldSetting, deleteConfigFieldSetting } from "@/components/networking";
import { Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/table_cells";

import RouterSettings from "@/components/router_settings";
import Fallbacks from "@/components/Settings/RouterSettings/Fallbacks/Fallbacks";
import RoutingGroups from "@/components/routing_groups";
import { RequestTagMappingsEditor, requestTagMappingsAreValid } from "./RequestTagMappings";

const PROMPT_CACHING_TAB = "prompt_caching";
const ENABLE_ANTHROPIC_PROMPT_CACHING = "enable_anthropic_prompt_caching";
const ANTHROPIC_PROMPT_CACHING_TTL = "anthropic_prompt_caching_ttl";
const OPENAI_SYSTEM_MESSAGES_FIRST = "openai_system_messages_first";

const isOn = (value: unknown) => value === true || value === "true";

interface GeneralSettingsPageProps {
  accessToken: string | null;
  userRole: string | null;
  userID: string | null;
}

export interface generalSettingsItem {
  field_name: string;
  field_type: string;
  field_value: any;
  field_description: string;
  stored_in_db: boolean | null;
  editable?: boolean;
  field_options?: string[] | null;
  field_tab?: string | null;
  field_default_value?: any;
}

const NUMERIC_INPUT_WIDTH = "w-36";

const toNumericValue = (raw: string): number | null => (raw === "" ? null : Number(raw));

const toListValue = (raw: string): string[] | null => {
  const items = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
  return items.length === 0 ? null : items;
};

const fromListValue = (value: unknown): string => (Array.isArray(value) ? value.join(", ") : "");

const SettingValueEditor: React.FC<{
  setting: generalSettingsItem;
  onChange: (fieldName: string, newValue: any) => void;
}> = ({ setting, onChange }) => {
  if (setting.field_name === "request_tag_mappings") {
    return (
      <RequestTagMappingsEditor
        value={setting.field_value}
        disabled={setting.editable === false}
        onChange={(rules) => onChange(setting.field_name, rules)}
      />
    );
  }
  if (setting.field_type === "String") {
    return (
      <Input
        aria-label={setting.field_name}
        value={setting.field_value ?? ""}
        onChange={(event) => onChange(setting.field_name, event.target.value)}
      />
    );
  }
  if (setting.field_type === "Integer") {
    return (
      <Input
        type="number"
        step={1}
        className={NUMERIC_INPUT_WIDTH}
        value={setting.field_value ?? ""}
        onChange={(event) => onChange(setting.field_name, toNumericValue(event.target.value))}
      />
    );
  }
  if (setting.field_type === "Boolean") {
    return (
      <Switch
        checked={setting.field_value === true || setting.field_value === "true"}
        onCheckedChange={(checked) => onChange(setting.field_name, checked)}
      />
    );
  }
  if (setting.field_type === "Float") {
    return (
      <Input
        type="number"
        min={0}
        max={1}
        step={0.05}
        className={NUMERIC_INPUT_WIDTH}
        value={setting.field_value ?? ""}
        onChange={(event) => onChange(setting.field_name, toNumericValue(event.target.value))}
      />
    );
  }
  if (setting.field_type === "Dollar") {
    return (
      <InputGroup className={NUMERIC_INPUT_WIDTH}>
        <InputGroupAddon>¥</InputGroupAddon>
        <InputGroupInput
          type="number"
          min={0.01}
          step={0.25}
          value={setting.field_value ?? ""}
          onChange={(event) => onChange(setting.field_name, toNumericValue(event.target.value))}
        />
      </InputGroup>
    );
  }
  if (setting.field_type === "List") {
    return (
      <Input
        key={String(setting.stored_in_db)}
        aria-label={setting.field_name}
        placeholder="Comma-separated values"
        defaultValue={fromListValue(setting.field_value)}
        onChange={(event) => onChange(setting.field_name, toListValue(event.target.value))}
      />
    );
  }
  if (setting.field_type === "Select") {
    return (
      <Select value={setting.field_value ?? null} onValueChange={(newValue) => onChange(setting.field_name, newValue)}>
        <SelectTrigger className="min-w-32">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>
            <L>Default</L>
          </SelectItem>
          {(setting.field_options ?? []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return null;
};

export const PromptCachingPanel: React.FC<{
  accessToken: string;
  settings: generalSettingsItem[];
  onChange: (fieldName: string, newValue: any) => void;
}> = ({ accessToken, settings, onChange }) => {
  const enableSetting = settings.find((s) => s.field_name === ENABLE_ANTHROPIC_PROMPT_CACHING);
  const ttlSetting = settings.find((s) => s.field_name === ANTHROPIC_PROMPT_CACHING_TTL);
  const systemFirstSetting = settings.find((s) => s.field_name === OPENAI_SYSTEM_MESSAGES_FIRST);

  // The rows come from the same registry the General tab reads; if they
  // are not loaded yet there is nothing to render.
  if (!enableSetting) {
    return null;
  }

  const enabled = isOn(enableSetting.field_value);

  // Apply immediately: a toggle and a dropdown are direct controls, so there is
  // no separate Update button. Clearing the ttl resets it to the provider default.
  const persist = (fieldName: string, value: any) => {
    onChange(fieldName, value);
    if (value === "" || value === null || value === undefined) {
      deleteConfigFieldSetting(accessToken, fieldName);
    } else {
      updateConfigFieldSetting(accessToken, fieldName, value);
    }
  };

  return (
    <Card>
      <CardContent>
        <CardTitle>Prompt Caching</CardTitle>

        <div className="mt-6 flex items-start justify-between gap-8">
          <div className="min-w-0 max-w-2xl">
            <p className="font-medium">
              <L>Automatic Anthropic prompt caching</L>
            </p>
            <p className="mt-1 break-words text-xs text-muted-foreground">
              <L>{enableSetting.field_description}</L>
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={(checked) => persist(ENABLE_ANTHROPIC_PROMPT_CACHING, checked)} />
        </div>

        {ttlSetting && (
          <div className="mt-6 flex items-start justify-between gap-8">
            <div className="min-w-0 max-w-2xl">
              <p className={`font-medium ${enabled ? "" : "text-muted-foreground"}`}>
                <L>Cache lifetime (TTL)</L>
              </p>
              <p className="mt-1 break-words text-xs text-muted-foreground">
                <L>{ttlSetting.field_description}</L>
              </p>
            </div>
            <Select
              disabled={!enabled}
              value={ttlSetting.field_value ?? null}
              onValueChange={(newValue) => persist(ANTHROPIC_PROMPT_CACHING_TTL, newValue)}
            >
              <SelectTrigger className="min-w-40">
                <SelectValue placeholder="5m (default)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>
                  <L>5m (default)</L>
                </SelectItem>
                {(ttlSetting.field_options ?? []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {systemFirstSetting && (
          <div className="mt-6 flex items-start justify-between gap-8">
            <div className="min-w-0 max-w-2xl">
              <p className="font-medium">
                <L>System messages first for OpenAI</L>
              </p>
              <p className="mt-1 break-words text-xs text-muted-foreground">
                <L>{systemFirstSetting.field_description}</L>
              </p>
            </div>
            <Switch
              aria-label="System messages first for OpenAI"
              checked={isOn(systemFirstSetting.field_value)}
              onCheckedChange={(checked) => persist(OPENAI_SYSTEM_MESSAGES_FIRST, checked)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GeneralSettings: React.FC<GeneralSettingsPageProps> = ({ accessToken, userRole, userID }) => {
  const [generalSettings, setGeneralSettings] = useState<generalSettingsItem[]>([]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    getGeneralSettingsCall(accessToken).then((data) => {
      let general_settings = data;
      setGeneralSettings(general_settings);
    });
  }, [accessToken]);

  const handleInputChange = (fieldName: string, newValue: any) => {
    // Update the value in the state
    const updatedSettings = generalSettings.map((setting) =>
      setting.field_name === fieldName ? { ...setting, field_value: newValue } : setting,
    );
    setGeneralSettings(updatedSettings);
  };

  const handleUpdateField = async (fieldName: string) => {
    if (!accessToken) {
      return;
    }

    const setting = generalSettings.find((setting) => setting.field_name === fieldName);
    const fieldValue = setting?.field_value;

    if (fieldValue == null) {
      if (setting?.field_type === "Select" || setting?.field_type === "List") handleResetField(fieldName);
      return;
    }
    try {
      await updateConfigFieldSetting(accessToken, fieldName, fieldValue);
      // update value in state

      const updatedSettings = generalSettings.map((setting) =>
        setting.field_name === fieldName ? { ...setting, stored_in_db: true } : setting,
      );
      setGeneralSettings(updatedSettings);
    } catch (error) {
      // do something
    }
  };

  const handleResetField = (fieldName: string) => {
    if (!accessToken) {
      return;
    }

    try {
      deleteConfigFieldSetting(accessToken, fieldName);
      // update value in state

      const updatedSettings = generalSettings.map((setting) =>
        setting.field_name === fieldName
          ? { ...setting, stored_in_db: null, field_value: setting.field_default_value ?? null }
          : setting,
      );
      setGeneralSettings(updatedSettings);
    } catch (error) {
      // do something
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="w-full">
      <PageHeader className="mb-4">
        <PageHeaderTitle>Router Settings</PageHeaderTitle>
      </PageHeader>
      <Tabs defaultValue="loadbalancing" className="w-full">
        <TabsList variant="line">
          <TabsTrigger value="loadbalancing">Loadbalancing</TabsTrigger>
          <TabsTrigger value="routing-groups">Routing Groups</TabsTrigger>
          <TabsTrigger value="fallbacks">Fallbacks</TabsTrigger>
          <TabsTrigger value="prompt-caching">Prompt Caching</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value="loadbalancing" keepMounted>
          <RouterSettings accessToken={accessToken} userRole={userRole} userID={userID} />
        </TabsContent>
        <TabsContent value="routing-groups" keepMounted>
          <RoutingGroups />
        </TabsContent>
        <TabsContent value="fallbacks" keepMounted>
          <Fallbacks accessToken={accessToken} userRole={userRole} userID={userID} />
        </TabsContent>
        <TabsContent value="prompt-caching" keepMounted>
          <PromptCachingPanel accessToken={accessToken} settings={generalSettings} onChange={handleInputChange} />
        </TabsContent>
        <TabsContent value="general" keepMounted>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <L>Setting</L>
                    </TableHead>
                    <TableHead>
                      <L>Value</L>
                    </TableHead>
                    <TableHead>
                      <L>Status</L>
                    </TableHead>
                    <TableHead>
                      <L>Action</L>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generalSettings
                    .filter((value) => value.field_type !== "TypedDictionary" && value.field_tab !== PROMPT_CACHING_TAB)
                    .map((value, index) => (
                      <TableRow key={index}>
                        <TableCell className="whitespace-normal">
                          <p className="break-words">
                            <L>{value.field_name}</L>
                          </p>
                          <p className="mt-1 break-words text-xs italic text-muted-foreground">
                            <L>
                              {value.field_name === "pass_through_endpoints"
                                ? "Configure pass-through endpoints for provider-specific APIs."
                                : value.field_description}
                            </L>
                          </p>
                        </TableCell>
                        <TableCell>
                          <SettingValueEditor setting={value} onChange={handleInputChange} />
                        </TableCell>
                        <TableCell>
                          {value.stored_in_db == true ? (
                            <StatusBadge tone="success" label="In DB" />
                          ) : value.stored_in_db == false ? (
                            <StatusBadge tone="neutral" label="In Config" />
                          ) : (
                            <StatusBadge tone="neutral" label="Not Set" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            disabled={
                              value.field_name === "request_tag_mappings" &&
                              (value.editable === false || !requestTagMappingsAreValid(value.field_value))
                            }
                            onClick={() => handleUpdateField(value.field_name)}
                          >
                            <L>Update</L>
                          </Button>
                          {value.field_name === "request_tag_mappings" && value.editable === false ? null : (
                            <span
                              onClick={() => handleResetField(value.field_name)}
                              className="inline-flex shrink-0 cursor-pointer items-center justify-center px-1.5 py-1.5 text-destructive"
                            >
                              <Trash2 className="h-5 w-5 shrink-0" />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralSettings;
