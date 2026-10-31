import { LocalizedText as L } from "@/contexts/LocaleContext";

import { LiteUiMask } from "@/contexts/LiteUiContext";
import React from "react";
import LatencyBasedConfiguration from "./LatencyBasedConfiguration";
import { RouterSettingsSource, isOwnedByConfig } from "./ConfigOwned";
import ReliabilityRetriesSection from "./ReliabilityRetriesSection";
import RoutingStrategySelector from "./RoutingStrategySelector";
import TagFilteringToggle from "./TagFilteringToggle";

export interface RouterSettingsFormValue {
  routerSettings: { [key: string]: any };
  selectedStrategy: string | null;
  enableTagFiltering: boolean;
}

interface RouterSettingsFormProps {
  value: RouterSettingsFormValue;
  onChange: (value: RouterSettingsFormValue) => void;
  routerFieldsMetadata: { [key: string]: any };
  availableRoutingStrategies: string[];
  routingStrategyDescriptions: { [key: string]: string };
  routerSettingsSource?: RouterSettingsSource;
}

const RouterSettingsForm: React.FC<RouterSettingsFormProps> = ({
  value,
  onChange,
  routerFieldsMetadata,
  availableRoutingStrategies,
  routingStrategyDescriptions,
  routerSettingsSource = {},
}) => {
  const handleStrategyChange = (strategy: string) => {
    onChange({
      ...value,
      selectedStrategy: strategy,
    });
  };

  const handleTagFilteringToggle = (enabled: boolean) => {
    onChange({
      ...value,
      enableTagFiltering: enabled,
    });
  };

  return (
    <div className="w-full space-y-8 py-2">
      {/* Routing Settings Section */}
      <div className="space-y-6">
        <div className="max-w-3xl">
          <h3 className="text-sm font-medium text-foreground">
            <L>Routing Settings</L>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            <L>Configure how requests are routed to deployments</L>
          </p>
        </div>

        {/* Routing Strategy */}
        {availableRoutingStrategies.length > 0 && (
          <LiteUiMask>
            <RoutingStrategySelector
              selectedStrategy={value.selectedStrategy || value.routerSettings.routing_strategy || null}
              availableStrategies={availableRoutingStrategies}
              routingStrategyDescriptions={routingStrategyDescriptions}
              routerFieldsMetadata={routerFieldsMetadata}
              onStrategyChange={handleStrategyChange}
              ownedByConfig={isOwnedByConfig(routerSettingsSource, "routing_strategy")}
            />
          </LiteUiMask>
        )}

        {/* Tag Filtering */}
        <LiteUiMask>
          <TagFilteringToggle
            enabled={value.enableTagFiltering}
            routerFieldsMetadata={routerFieldsMetadata}
            onToggle={handleTagFilteringToggle}
            ownedByConfig={isOwnedByConfig(routerSettingsSource, "enable_tag_filtering")}
          />
        </LiteUiMask>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Strategy-Specific Args - Show immediately after strategy if latency-based */}
      {value.selectedStrategy === "latency-based-routing" && (
        <LiteUiMask>
          <LatencyBasedConfiguration
            routingStrategyArgs={value.routerSettings["routing_strategy_args"]}
            ownedByConfig={isOwnedByConfig(routerSettingsSource, "routing_strategy_args")}
          />
        </LiteUiMask>
      )}

      {/* Other Settings */}
      <ReliabilityRetriesSection
        routerSettings={value.routerSettings}
        routerFieldsMetadata={routerFieldsMetadata}
        routerSettingsSource={routerSettingsSource}
      />
    </div>
  );
};

export default RouterSettingsForm;
