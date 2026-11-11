import { useFeatureSupport } from "@canva/app-hooks";
import { requestFontSelection } from "@canva/asset";
import { initAppElement } from "@canva/design";
import {
  Accordion,
  AccordionItem,
  Alert,
  Box,
  Button,
  ColorSelector,
  Column,
  Columns,
  FormField,
  NumberInput,
  Rows,
  SegmentedControl,
  Select,
  Swatch,
  Switch,
  Text,
  TextInput,
  Title,
} from "@canva/app-ui-kit";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";

import type {
  NumberLineData,
  SelectedAppElement} from "src/canva_bridge";
import {
  DATA_VERSION,
  getAppElementClient,
  insertAsPlainImage,
  insertStepsAsText,
  loadCompatibleData,
  renderSvgToPng3x,
  uploadPngAsset,
  validateDataSize,
} from "src/canva_bridge";
import { mathMessages } from "src/i18n/math_messages";
import { solveAlgebra } from "src/lib/algebra";
import {
  AXIS_COLORS,
  BACKGROUND_COLORS,
  getContrastRatio,
  getReadableAxisColor,
  isDarkColor,
  SOLUTION_COLORS,
} from "src/lib/color_utils";
import { detectTopicFromInput, isInputCompatibleWithTopic } from "src/lib/detection";
import { solveIntegersOps, solveIntegersOrder } from "src/lib/integers";
import { renderNumberLineSvg } from "src/lib/svg_renderer";
import type {
  BackgroundMode,
  CalculationResult,
  NumberLineSettings,
  NumberLineVisualData,
  Topic,
  Universe,
} from "src/lib/types";

export const App: React.FC = () => {
  const intl = useIntl();
  const isSupported = useFeatureSupport();

  // Selected element on Canva canvas
  const [selected, setSelected] = useState<SelectedAppElement | null>(null);
  const lastLoaded = useRef<string | null>(null);

  // App state
  const [topic, setTopic] = useState<Topic>("integers_ops");
  const [input, setInput] = useState<string>("-3 + 5");
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ code: string; params?: Record<string, any> } | null>(null);
  const [autoTopicSwitchedName, setAutoTopicSwitchedName] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<NumberLineSettings>({
    topic: "integers_ops",
    autoScale: true,
    manualMin: -10,
    manualMax: 10,
    manualStep: 1,
    solutionColor: "#3B82F6",
    axisColor: "#333333",
    backgroundMode: "white",
    backgroundColor: "#FDFBF7",
    fontFamily: "sans-serif",
    showSteps: true,
    showLabels: true,
    showTitle: true,
    universe: "real",
    worksheetMode: false,
  });

  // Calculate math result
  const calculate = useCallback(
    (currentInput: string, currentTopic: Topic, currentSettings: NumberLineSettings) => {
      setErrorInfo(null);
      try {
        if (!currentInput.trim()) {
          setCalcResult(null);
          return;
        }

        if (currentTopic === "integers_ops") {
          const res = solveIntegersOps(currentInput);
          setCalcResult({ type: "integers_ops", data: res });
        } else if (currentTopic === "integers_order") {
          const res = solveIntegersOrder(currentInput);
          setCalcResult({ type: "integers_order", data: res });
        } else if (currentTopic === "linear_eq" || currentTopic === "linear_ineq") {
          const res = solveAlgebra(currentInput, currentSettings.universe, intl.locale);
          setCalcResult({ type: "algebra", data: res });
        }
      } catch (err: any) {
        setCalcResult(null);
        if (err && err.code) {
          setErrorInfo({ code: err.code, params: err.params });
        } else {
          setErrorInfo({ code: "err_invalid_expression" });
        }
      }
    },
    [intl.locale]
  );

  // Initial calculation on load
  useEffect(() => {
    calculate(input, topic, settings);
  }, []); // Run once on mount

  // Listen to Canva app element selection
  useEffect(() => {
    try {
      const client = getAppElementClient();
      return client.registerOnElementChange((el: any) => {
        if (el) {
          setSelected(el);
          if (lastLoaded.current === el.data.imageRef) {
            return;
          }
          lastLoaded.current = el.data.imageRef;

          const loaded = loadCompatibleData(el.data);
          setTopic(loaded.topic);
          setInput(loaded.input);
          const mergedSettings: NumberLineSettings = {
            ...settings,
            ...loaded.settings,
            topic: loaded.topic,
          };
          setSettings(mergedSettings);
          calculate(loaded.input, loaded.topic, mergedSettings);
        } else {
          lastLoaded.current = null;
          setSelected(null);
        }
      });
    } catch {
      // In tests or outside Canva
    }
  }, [calculate, settings]);

  // Handle topic change manually
  const handleTopicChange = (newTopic: Topic) => {
    setTopic(newTopic);
    setAutoTopicSwitchedName(null);

    // If existing input is not compatible with new topic, clear it
    if (!isInputCompatibleWithTopic(input, newTopic)) {
      setInput("");
      setCalcResult(null);
      setErrorInfo(null);
    } else {
      calculate(input, newTopic, { ...settings, topic: newTopic });
    }
  };

  // Handle input change and auto-detection
  const handleInputChange = (val: string) => {
    setInput(val);
    setAutoTopicSwitchedName(null);

    // Auto topic detection: if input matches a different topic, switch automatically
    if (val.trim()) {
      const detected = detectTopicFromInput(val);
      if (detected !== topic) {
        setTopic(detected);
        const topicNames: Record<Topic, string> = {
          integers_ops: intl.formatMessage(mathMessages.topicIntegersOps),
          integers_order: intl.formatMessage(mathMessages.topicIntegersOrder),
          linear_eq: intl.formatMessage(mathMessages.topicLinearEq),
          linear_ineq: intl.formatMessage(mathMessages.topicLinearIneq),
        };
        setAutoTopicSwitchedName(topicNames[detected]);
        calculate(val, detected, { ...settings, topic: detected });
        return;
      }
    }

    calculate(val, topic, settings);
  };

  // Symbol insertion at cursor
  const insertSymbol = (sym: string) => {
    const next = input + sym;
    handleInputChange(next);
  };

  // Render SVG preview
  const visualData: NumberLineVisualData | null = calcResult?.data.visual || null;

  const svgPreviewResult = useMemo(() => {
    if (!visualData) return null;
    return renderNumberLineSvg({
      visual: visualData,
      settings,
      separateText: false, // In UI preview, always render text inside SVG for crisp display
    });
  }, [visualData, settings]);

  // Contrast warning calculation
  const contrastRatio = useMemo(() => {
    const bg =
      settings.backgroundMode === "color"
        ? settings.backgroundColor
        : settings.backgroundMode === "white"
        ? "#FFFFFF"
        : "#FFFFFF";
    return getContrastRatio(settings.axisColor, bg);
  }, [settings.axisColor, settings.backgroundMode, settings.backgroundColor]);

  const hasLowContrast = contrastRatio < 2.0;

  const handleFixContrast = () => {
    const bg =
      settings.backgroundMode === "color"
        ? settings.backgroundColor
        : "#FFFFFF";
    const recommended = getReadableAxisColor(bg);
    setSettings((s) => ({ ...s, axisColor: recommended }));
  };

  // Add / Update App Element
  const handleAddOrUpdate = async (isNew: boolean) => {
    if (!calcResult || !visualData) return;
    setBusy(true);
    setSuccessBanner(null);

    try {
      // 1. Generate SVG for Canva: if Canva font is used, separate text!
      const hasCanvaFont = !!settings.canvaFont;
      const exportSvgResult = renderNumberLineSvg({
        visual: visualData,
        settings,
        separateText: hasCanvaFont,
      });

      // 2. Render SVG to 3x PNG
      const pngDataUrl = await renderSvgToPng3x(
        exportSvgResult.svg,
        exportSvgResult.width,
        exportSvgResult.height
      );

      // 3. Upload PNG to Canva
      const imageRef = await uploadPngAsset(pngDataUrl);

      // 4. Construct NumberLineData
      const elementData: NumberLineData = {
        version: DATA_VERSION,
        topic,
        input,
        imageRef,
        width: exportSvgResult.width,
        height: exportSvgResult.height,
        settings,
        textBoxes: hasCanvaFont ? exportSvgResult.textBoxes : undefined,
        canvaFontRef: settings.canvaFont?.id as any,
        altText: settings.worksheetMode
          ? visualData.worksheetAltText
          : visualData.altText,
      };

      // Check data size limit (5 KB)
      if (!validateDataSize(elementData)) {
        setErrorInfo({ code: "err_app_element_too_large" });
        setBusy(false);
        return;
      }

      // Check app element support
      let client: any = null;
      const canUseAppElement = isSupported ? isSupported(initAppElement) : true;
      if (canUseAppElement) {
        try {
          client = getAppElementClient();
        } catch {
          // App element not supported
        }
      }

      if (client && client.addElement) {
        lastLoaded.current = imageRef;

        if (selected && !isNew) {
          // Update selected element
          await selected.update({ data: elementData });
          setSuccessBanner(intl.formatMessage(mathMessages.updatedSuccess));
        } else {
          // Add new element
          await client.addElement({ data: elementData });
          setSuccessBanner(intl.formatMessage(mathMessages.addedSuccess));
        }
      } else {
        // Fallback: add plain image
        const success = await insertAsPlainImage(imageRef, isSupported);
        if (success) {
          setSuccessBanner(intl.formatMessage(mathMessages.addedAsImage));
        }
      }
    } catch {
      // Ignore or handle
    } finally {
      setBusy(false);
    }
  };

  // Add steps as text
  const handleAddSteps = async () => {
    if (!calcResult) return;
    const steps = calcResult.data.steps;
    const textLines = steps.map((s, idx) => {
      const msgDef = (mathMessages as any)[s.code];
      const translated = msgDef
        ? intl.formatMessage(msgDef, s.params)
        : `${s.code}: ${JSON.stringify(s.params)}`;
      return `${idx + 1}. ${translated}`;
    });

    const fullText = textLines.join("\n");
    const ok = await insertStepsAsText(fullText, isSupported);
    if (ok) {
      setSuccessBanner(intl.formatMessage(mathMessages.stepsAddedSuccess));
    }
  };

  // Pick font from Canva
  const handleSelectCanvaFont = async () => {
    try {
      const res = await requestFontSelection();
      if (res.type === "completed") {
        setSettings((s) => ({
          ...s,
          canvaFont: { id: res.font.ref, name: res.font.name },
        }));
      }
    } catch {
      // Font selection cancelled or error
    }
  };

  const topicOptions: { value: Topic; label: string }[] = [
    { value: "integers_ops", label: intl.formatMessage(mathMessages.topicIntegersOps) },
    { value: "integers_order", label: intl.formatMessage(mathMessages.topicIntegersOrder) },
    { value: "linear_eq", label: intl.formatMessage(mathMessages.topicLinearEq) },
    { value: "linear_ineq", label: intl.formatMessage(mathMessages.topicLinearIneq) },
  ];

  const getPlaceholder = () => {
    switch (topic) {
      case "integers_ops":
        return intl.formatMessage(mathMessages.placeholderIntegersOps);
      case "integers_order":
        return intl.formatMessage(mathMessages.placeholderIntegersOrder);
      case "linear_eq":
        return intl.formatMessage(mathMessages.placeholderLinearEq);
      case "linear_ineq":
        return intl.formatMessage(mathMessages.placeholderLinearIneq);
      default:
        return "";
    }
  };

  const ready = !!calcResult && !!svgPreviewResult && !busy;

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        {/* Title */}
        <Title size="small">{intl.formatMessage(mathMessages.appTitle)}</Title>

        {/* Selected Editing Banner */}
        {selected && (
          <Alert tone="info">
            {intl.formatMessage(mathMessages.editingBanner)}
          </Alert>
        )}

        {/* Success Banner */}
        {successBanner && (
          <Alert tone="positive">
            {successBanner}
          </Alert>
        )}

        {/* Auto Topic Switched Notification */}
        {autoTopicSwitchedName && (
          <Alert tone="info">
            {intl.formatMessage(mathMessages.autoTopicSwitched, {
              topicName: autoTopicSwitchedName,
            })}
          </Alert>
        )}

        {/* Error Alert */}
        {errorInfo && (
          <Alert tone="critical">
            {(mathMessages as any)[errorInfo.code]
              ? intl.formatMessage((mathMessages as any)[errorInfo.code], errorInfo.params)
              : intl.formatMessage(mathMessages.errInvalidExpression)}
          </Alert>
        )}

        {/* Sticky Preview at the top */}
        <div className={styles.stickyPreview}>
          <Rows spacing="1u">
            <div
              className={`${styles.previewWrapper} ${
                settings.backgroundMode === "transparent"
                  ? isDarkColor(settings.axisColor)
                    ? styles.transparentPatternLight
                    : styles.transparentPatternDark
                  : ""
              }`}
              style={{
                backgroundColor:
                  settings.backgroundMode === "color"
                    ? settings.backgroundColor
                    : settings.backgroundMode === "white"
                    ? "#ffffff"
                    : undefined,
              }}
            >
              {svgPreviewResult ? (
                <div
                  className={styles.previewSvg}
                  draggable={false}
                  dangerouslySetInnerHTML={{ __html: svgPreviewResult.svg }}
                />
              ) : (
                <Box padding="4u">
                  <Text tone="tertiary">
                    {intl.formatMessage(mathMessages.btnShow)}
                  </Text>
                </Box>
              )}
            </div>

            {/* Worksheet mode switch directly beneath preview */}
            <Switch
              label={intl.formatMessage(mathMessages.worksheetToggle)}
              value={settings.worksheetMode}
              onChange={(checked) => setSettings((s) => ({ ...s, worksheetMode: checked }))}
            />
          </Rows>
        </div>

        {/* Topic Dropdown */}
        <FormField
          label={intl.formatMessage(mathMessages.topicLabel)}
          control={(props) => (
            <Select<Topic>
              {...props}
              options={topicOptions}
              value={topic}
              onChange={(val) => handleTopicChange(val as Topic)}
            />
          )}
        />

        {/* Problem Input */}
        <FormField
          label={intl.formatMessage(mathMessages.problemLabel)}
          control={(props) => (
            <TextInput
              {...props}
              value={input}
              placeholder={getPlaceholder()}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  calculate(input, topic, settings);
                }
              }}
            />
          )}
        />

        {/* Symbol Bar */}
        <div className={styles.symbolBar}>
          {topic === "integers_ops" && (
            <>
              {["+", "−", "(", ")"].map((sym) => (
                <Button
                  key={sym}
                  variant="secondary"
                  size="small"
                  onClick={() => insertSymbol(sym)}
                >
                  {sym}
                </Button>
              ))}
            </>
          )}

          {topic === "integers_order" && (
            <>
              {[",", "−"].map((sym) => (
                <Button
                  key={sym}
                  variant="secondary"
                  size="small"
                  onClick={() => insertSymbol(sym)}
                >
                  {sym}
                </Button>
              ))}
            </>
          )}

          {topic === "linear_eq" && (
            <>
              {["=", "(", ")"].map((sym) => (
                <Button
                  key={sym}
                  variant="secondary"
                  size="small"
                  onClick={() => insertSymbol(sym)}
                >
                  {sym}
                </Button>
              ))}
            </>
          )}

          {topic === "linear_ineq" && (
            <>
              {["<", ">", "≤", "≥", "(", ")"].map((sym) => (
                <Button
                  key={sym}
                  variant="secondary"
                  size="small"
                  onClick={() => insertSymbol(sym)}
                >
                  {sym}
                </Button>
              ))}
            </>
          )}
        </div>

        {/* Show & Reset Buttons */}
        <Columns spacing="1u">
          <Column>
            <Button
              variant="secondary"
              stretch
              onClick={() => calculate(input, topic, settings)}
            >
              {intl.formatMessage(mathMessages.btnShow)}
            </Button>
          </Column>
          <Column width="content">
            <Button
              variant="tertiary"
              onClick={() => {
                setInput("");
                setCalcResult(null);
                setErrorInfo(null);
                setAutoTopicSwitchedName(null);
                setSuccessBanner(null);
              }}
            >
              {intl.formatMessage(mathMessages.btnReset)}
            </Button>
          </Column>
        </Columns>

        {/* Steps and Results */}
        {calcResult && (
          <Rows spacing="1.5u">
            {settings.showSteps && (
              <Box padding="1.5u" borderRadius="standard">
                <Rows spacing="1u">
                  <Text size="small">
                    <strong>{intl.formatMessage(mathMessages.stepsHeader)}</strong>
                  </Text>
                  <div>
                    {calcResult.data.steps.map((step, idx) => {
                      const msgDef = (mathMessages as any)[step.code];
                      return (
                        <div
                          key={idx}
                          className={`${styles.stepItem} ${step.flip ? styles.stepFlip : ""}`}
                        >
                          {msgDef ? intl.formatMessage(msgDef, step.params) : null}
                        </div>
                      );
                    })}
                  </div>
                </Rows>
              </Box>
            )}

            {/* Action Buttons: Add / Update */}
            <Rows spacing="1u">
              {selected ? (
                <>
                  <Button
                    variant="primary"
                    stretch
                    disabled={!ready}
                    loading={busy}
                    onClick={() => handleAddOrUpdate(false)}
                  >
                    {intl.formatMessage(mathMessages.btnUpdateElement)}
                  </Button>
                  <Button
                    variant="secondary"
                    stretch
                    disabled={!ready}
                    loading={busy}
                    onClick={() => handleAddOrUpdate(true)}
                  >
                    {intl.formatMessage(mathMessages.btnAddAsNew)}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  stretch
                  disabled={!ready}
                  loading={busy}
                  onClick={() => handleAddOrUpdate(true)}
                >
                  {intl.formatMessage(mathMessages.btnAddToDesign)}
                </Button>
              )}

              <Button
                variant="secondary"
                stretch
                disabled={!ready}
                onClick={handleAddSteps}
              >
                {intl.formatMessage(mathMessages.btnAddSteps)}
              </Button>
            </Rows>
          </Rows>
        )}

        {/* Settings Accordion */}
        <Accordion>
          <AccordionItem title={intl.formatMessage(mathMessages.settingsHeader)}>
            <Rows spacing="2u">
              {/* Universe (for PLSV & PtLSV) */}
              {(topic === "linear_eq" || topic === "linear_ineq") && (
                <FormField
                  label={intl.formatMessage(mathMessages.universeLabel)}
                  control={(props) => (
                    <SegmentedControl<Universe>
                      {...props}
                      value={settings.universe}
                      options={[
                        {
                          value: "real",
                          label: intl.formatMessage(mathMessages.universeReal),
                        },
                        {
                          value: "integer",
                          label: intl.formatMessage(mathMessages.universeInteger),
                        },
                      ]}
                      onChange={(val) => {
                        const nextUniverse = val as Universe;
                        setSettings((s) => ({ ...s, universe: nextUniverse }));
                        calculate(input, topic, { ...settings, universe: nextUniverse });
                      }}
                    />
                  )}
                />
              )}

              {/* Scale Settings */}
              <FormField
                label={intl.formatMessage(mathMessages.scaleLabel)}
                control={(props) => (
                  <SegmentedControl<"auto" | "manual">
                    {...props}
                    value={settings.autoScale ? "auto" : "manual"}
                    options={[
                      { value: "auto", label: intl.formatMessage(mathMessages.scaleAuto) },
                      { value: "manual", label: intl.formatMessage(mathMessages.scaleManual) },
                    ]}
                    onChange={(val) =>
                      setSettings((s) => ({ ...s, autoScale: val === "auto" }))
                    }
                  />
                )}
              />

              {!settings.autoScale && (
                <Columns spacing="1u">
                  <Column>
                    <FormField
                      label={intl.formatMessage(mathMessages.scaleMin)}
                      control={(props) => (
                        <NumberInput
                          {...props}
                          value={settings.manualMin}
                          onChange={(n) => {
                            if (n !== undefined) setSettings((s) => ({ ...s, manualMin: n }));
                          }}
                        />
                      )}
                    />
                  </Column>
                  <Column>
                    <FormField
                      label={intl.formatMessage(mathMessages.scaleMax)}
                      control={(props) => (
                        <NumberInput
                          {...props}
                          value={settings.manualMax}
                          onChange={(n) => {
                            if (n !== undefined) setSettings((s) => ({ ...s, manualMax: n }));
                          }}
                        />
                      )}
                    />
                  </Column>
                  <Column>
                    <FormField
                      label={intl.formatMessage(mathMessages.scaleStep)}
                      control={(props) => (
                        <NumberInput
                          {...props}
                          min={1}
                          value={settings.manualStep}
                          onChange={(n) => {
                            if (n !== undefined && n >= 1) setSettings((s) => ({ ...s, manualStep: n }));
                          }}
                        />
                      )}
                    />
                  </Column>
                </Columns>
              )}

              {/* Solution Color */}
              <div>
                <Text size="small">
                  <strong>{intl.formatMessage(mathMessages.colorSolution)}</strong>
                </Text>
                <div className={styles.swatchGrid} style={{ marginTop: 8 }}>
                  {SOLUTION_COLORS.map((col) => (
                    <Swatch
                      key={col.value}
                      fill={[col.value]}
                      active={settings.solutionColor === col.value}
                      tooltipLabel={col.name}
                      onClick={() => setSettings((s) => ({ ...s, solutionColor: col.value }))}
                    />
                  ))}
                  <ColorSelector
                    color={settings.solutionColor}
                    triggerMode="addColorButton"
                    onChange={(color) => setSettings((s) => ({ ...s, solutionColor: color }))}
                  />
                </div>
              </div>

              {/* Number Line Axis Color */}
              <div>
                <Text size="small">
                  <strong>{intl.formatMessage(mathMessages.colorAxis)}</strong>
                </Text>
                <div className={styles.swatchGrid} style={{ marginTop: 8 }}>
                  {AXIS_COLORS.map((col) => (
                    <Swatch
                      key={col.value}
                      fill={[col.value]}
                      active={settings.axisColor === col.value}
                      tooltipLabel={col.name}
                      onClick={() => setSettings((s) => ({ ...s, axisColor: col.value }))}
                    />
                  ))}
                  <ColorSelector
                    color={settings.axisColor}
                    triggerMode="addColorButton"
                    onChange={(color) => setSettings((s) => ({ ...s, axisColor: color }))}
                  />
                </div>
              </div>

              {/* Background Mode */}
              <FormField
                label={intl.formatMessage(mathMessages.bgModeLabel)}
                control={(props) => (
                  <SegmentedControl<BackgroundMode>
                    {...props}
                    value={settings.backgroundMode}
                    options={[
                      { value: "white", label: intl.formatMessage(mathMessages.bgWhite) },
                      { value: "transparent", label: intl.formatMessage(mathMessages.bgTransparent) },
                      { value: "color", label: intl.formatMessage(mathMessages.bgColor) },
                    ]}
                    onChange={(val) =>
                      setSettings((s) => ({ ...s, backgroundMode: val as BackgroundMode }))
                    }
                  />
                )}
              />

              {settings.backgroundMode === "color" && (
                <div className={styles.swatchGrid}>
                  {BACKGROUND_COLORS.map((col) => (
                    <Swatch
                      key={col.value}
                      fill={[col.value]}
                      active={settings.backgroundColor === col.value}
                      tooltipLabel={col.name}
                      onClick={() => setSettings((s) => ({ ...s, backgroundColor: col.value }))}
                    />
                  ))}
                  <ColorSelector
                    color={settings.backgroundColor}
                    triggerMode="addColorButton"
                    onChange={(color) => setSettings((s) => ({ ...s, backgroundColor: color }))}
                  />
                </div>
              )}

              {/* Contrast warning */}
              {hasLowContrast && (
                <Rows spacing="1u">
                  <Alert tone="warn">
                    {intl.formatMessage(mathMessages.contrastWarning)}
                  </Alert>
                  <Button variant="secondary" size="small" onClick={handleFixContrast}>
                    {intl.formatMessage(mathMessages.btnFixContrast)}
                  </Button>
                </Rows>
              )}

              {/* Font Settings */}
              <div>
                <Text size="small">
                  <strong>{intl.formatMessage(mathMessages.fontLabel)}</strong>
                </Text>
                <div style={{ marginTop: 8 }}>
                  {settings.canvaFont ? (
                    <Rows spacing="1u">
                      <Button variant="secondary" onClick={handleSelectCanvaFont}>
                        {intl.formatMessage(mathMessages.btnChangeCanvaFont, {
                          fontName: settings.canvaFont.name,
                        })}
                      </Button>
                      <Button
                        variant="tertiary"
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            canvaFont: undefined,
                            fontFamily: "sans-serif",
                          }))
                        }
                      >
                        {intl.formatMessage(mathMessages.btnResetFont)}
                      </Button>
                      <Text size="small" tone="tertiary">
                        {intl.formatMessage(mathMessages.canvaFontNotice, {
                          fontName: settings.canvaFont.name,
                        })}
                      </Text>
                    </Rows>
                  ) : (
                    <Rows spacing="1u">
                      <Button variant="secondary" onClick={handleSelectCanvaFont}>
                        {intl.formatMessage(mathMessages.btnChooseCanvaFont)}
                      </Button>
                      <Text size="small" tone="tertiary">
                        {intl.formatMessage(mathMessages.canvaFontNoticeDefault)}
                      </Text>
                    </Rows>
                  )}
                </div>
              </div>

              {/* Visibility Toggles */}
              <Switch
                label={intl.formatMessage(mathMessages.toggleShowSteps)}
                value={settings.showSteps}
                onChange={(checked) => setSettings((s) => ({ ...s, showSteps: checked }))}
              />
              <Switch
                label={intl.formatMessage(mathMessages.toggleShowLabels)}
                value={settings.showLabels}
                onChange={(checked) => setSettings((s) => ({ ...s, showLabels: checked }))}
              />
              <Switch
                label={intl.formatMessage(mathMessages.toggleShowTitle)}
                value={settings.showTitle}
                onChange={(checked) => setSettings((s) => ({ ...s, showTitle: checked }))}
              />
            </Rows>
          </AccordionItem>
        </Accordion>
      </Rows>
    </div>
  );
};
