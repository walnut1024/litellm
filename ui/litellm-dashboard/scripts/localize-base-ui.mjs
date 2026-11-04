import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("../node_modules/@base-ui/react/", import.meta.url);
const { version } = JSON.parse(readFileSync(new URL("package.json", packageRoot), "utf8"));
if (version !== "1.6.0") throw new Error("Review the Base UI dismiss-label patch before upgrading");

function replaceOnce(source, before, after, filename) {
  if (source.includes(after)) return source;
  if (source.split(before).length !== 2) throw new Error(`Base UI patch no longer matches ${filename}`);
  return source.replace(before, after);
}

const patches = [
  ...["js", "mjs"].map((extension) => ({
    filename: `combobox/root/AriaCombobox.${extension}`,
    replacements: [
      ["    locale,", "    locale,\n    dismissLabel = 'Dismiss',"],
      ["    id,\n    labelId:", "    id,\n    dismissLabel,\n    labelId:"],
      ["      id,\n      selectedValue,", "      id,\n      dismissLabel,\n      selectedValue,"],
      ["}, [store, id, selectedValue,", "}, [store, dismissLabel, id, selectedValue,"],
    ],
  })),
  ...["d.ts", "d.mts"].map((extension) => ({
    filename: `combobox/root/AriaCombobox.${extension}`,
    replacements: [
      [
        "  locale?: Intl.LocalesArgument | undefined;",
        "  locale?: Intl.LocalesArgument | undefined;\n  dismissLabel?: string | undefined;",
      ],
    ],
  })),
  {
    filename: "combobox/utils/ComboboxInternalDismissButton.mjs",
    replacements: [
      [
        "import * as React from 'react';",
        "import * as React from 'react';\nimport { useStore } from '@base-ui/utils/store';",
      ],
      [
        "  const store = useComboboxRootContext();",
        "  const store = useComboboxRootContext();\n  const dismissLabel = useStore(store, state => state.dismissLabel);",
      ],
      ['"aria-label": "Dismiss",', '"aria-label": dismissLabel,'],
    ],
  },
  {
    filename: "combobox/utils/ComboboxInternalDismissButton.js",
    replacements: [
      [
        'var React = _interopRequireWildcard(require("react"));',
        'var React = _interopRequireWildcard(require("react"));\nvar _store = require("@base-ui/utils/store");',
      ],
      [
        "  const store = (0, _ComboboxRootContext.useComboboxRootContext)();",
        "  const store = (0, _ComboboxRootContext.useComboboxRootContext)();\n  const dismissLabel = (0, _store.useStore)(store, state => state.dismissLabel);",
      ],
      ['"aria-label": "Dismiss",', '"aria-label": dismissLabel,'],
    ],
  },
];

const updates = patches.map(({ filename, replacements }) => {
  const path = fileURLToPath(new URL(filename, packageRoot));
  const source = readFileSync(path, "utf8");
  const patched = replacements.reduce((text, [before, after]) => replaceOnce(text, before, after, filename), source);
  return { path, source, patched };
});
for (const { path, source, patched } of updates) {
  if (source !== patched) writeFileSync(path, patched);
}
