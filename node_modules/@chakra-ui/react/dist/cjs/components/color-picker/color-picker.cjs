"use strict";
"use client";
'use strict';

var colorPicker = require('@ark-ui/react/color-picker');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');

const {
  withProvider,
  withContext,
  useStyles: useColorPickerStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "colorPicker" });
const ColorPickerRootProvider = withProvider(colorPicker.ColorPicker.RootProvider, "root", { forwardAsChild: true });
const ColorPickerRoot = withProvider(colorPicker.ColorPicker.Root, "root", { forwardAsChild: true });
const ColorPickerPropsProvider = PropsProvider;
const ColorPickerLabel = withContext(colorPicker.ColorPicker.Label, "label", { forwardAsChild: true });
const ColorPickerControl = withContext(colorPicker.ColorPicker.Control, "control", { forwardAsChild: true });
const ColorPickerTrigger = withContext(colorPicker.ColorPicker.Trigger, "trigger", { forwardAsChild: true });
const ColorPickerPositioner = withContext(colorPicker.ColorPicker.Positioner, "positioner", { forwardAsChild: true });
const ColorPickerContent = withContext(colorPicker.ColorPicker.Content, "content", { forwardAsChild: true });
const ColorPickerArea = withContext(colorPicker.ColorPicker.Area, "area", { forwardAsChild: true });
const ColorPickerAreaBackground = withContext(colorPicker.ColorPicker.AreaBackground, "areaBackground", { forwardAsChild: true });
const ColorPickerAreaThumb = withContext(colorPicker.ColorPicker.AreaThumb, "areaThumb", { forwardAsChild: true });
const ColorPickerChannelSlider = withContext(colorPicker.ColorPicker.ChannelSlider, "channelSlider", { forwardAsChild: true });
const ColorPickerChannelSliderTrack = withContext(colorPicker.ColorPicker.ChannelSliderTrack, "channelSliderTrack", {
  forwardAsChild: true
});
const ColorPickerChannelSliderThumb = withContext(colorPicker.ColorPicker.ChannelSliderThumb, "channelSliderThumb", {
  forwardAsChild: true
});
const ColorPickerChannelInput = withContext(colorPicker.ColorPicker.ChannelInput, "channelInput", { forwardAsChild: true });
const ColorPickerTransparencyGrid = withContext(colorPicker.ColorPicker.TransparencyGrid, "transparencyGrid", { forwardAsChild: true });
const ColorPickerSwatchGroup = withContext(colorPicker.ColorPicker.SwatchGroup, "swatchGroup", { forwardAsChild: true });
const ColorPickerSwatchTrigger = withContext(colorPicker.ColorPicker.SwatchTrigger, "swatchTrigger", { forwardAsChild: true });
const ColorPickerSwatch = withContext(colorPicker.ColorPicker.Swatch, "swatch", { forwardAsChild: true });
const ColorPickerSwatchIndicator = withContext(colorPicker.ColorPicker.SwatchIndicator, "swatchIndicator", { forwardAsChild: true });
const ColorPickerValueText = withContext(colorPicker.ColorPicker.ValueText, "valueText", { forwardAsChild: true });
const ColorPickerValueSwatch = withContext(colorPicker.ColorPicker.ValueSwatch, "swatch", { forwardAsChild: true });
const ColorPickerView = withContext(colorPicker.ColorPicker.View, "view", { forwardAsChild: true });
const ColorPickerFormatTrigger = withContext(colorPicker.ColorPicker.FormatTrigger, "formatTrigger", { forwardAsChild: true });
const ColorPickerFormatSelect = withContext(colorPicker.ColorPicker.FormatSelect, "formatSelect", { forwardAsChild: true });
const ColorPickerEyeDropperTrigger = withContext(colorPicker.ColorPicker.EyeDropperTrigger, "eyeDropperTrigger", {
  forwardAsChild: true
});
const ColorPickerChannelSliderValueText = withContext(colorPicker.ColorPicker.ChannelSliderValueText, "channelSliderValueText", {
  forwardAsChild: true
});
const ColorPickerChannelSliderLabel = withContext(colorPicker.ColorPicker.ChannelSliderLabel, "channelSliderLabel", {
  forwardAsChild: true
});
const ColorPickerHiddenInput = colorPicker.ColorPicker.HiddenInput;
const ColorPickerContext = colorPicker.ColorPicker.Context;

exports.ColorPickerArea = ColorPickerArea;
exports.ColorPickerAreaBackground = ColorPickerAreaBackground;
exports.ColorPickerAreaThumb = ColorPickerAreaThumb;
exports.ColorPickerChannelInput = ColorPickerChannelInput;
exports.ColorPickerChannelSlider = ColorPickerChannelSlider;
exports.ColorPickerChannelSliderLabel = ColorPickerChannelSliderLabel;
exports.ColorPickerChannelSliderThumb = ColorPickerChannelSliderThumb;
exports.ColorPickerChannelSliderTrack = ColorPickerChannelSliderTrack;
exports.ColorPickerChannelSliderValueText = ColorPickerChannelSliderValueText;
exports.ColorPickerContent = ColorPickerContent;
exports.ColorPickerContext = ColorPickerContext;
exports.ColorPickerControl = ColorPickerControl;
exports.ColorPickerEyeDropperTrigger = ColorPickerEyeDropperTrigger;
exports.ColorPickerFormatSelect = ColorPickerFormatSelect;
exports.ColorPickerFormatTrigger = ColorPickerFormatTrigger;
exports.ColorPickerHiddenInput = ColorPickerHiddenInput;
exports.ColorPickerLabel = ColorPickerLabel;
exports.ColorPickerPositioner = ColorPickerPositioner;
exports.ColorPickerPropsProvider = ColorPickerPropsProvider;
exports.ColorPickerRoot = ColorPickerRoot;
exports.ColorPickerRootProvider = ColorPickerRootProvider;
exports.ColorPickerSwatch = ColorPickerSwatch;
exports.ColorPickerSwatchGroup = ColorPickerSwatchGroup;
exports.ColorPickerSwatchIndicator = ColorPickerSwatchIndicator;
exports.ColorPickerSwatchTrigger = ColorPickerSwatchTrigger;
exports.ColorPickerTransparencyGrid = ColorPickerTransparencyGrid;
exports.ColorPickerTrigger = ColorPickerTrigger;
exports.ColorPickerValueSwatch = ColorPickerValueSwatch;
exports.ColorPickerValueText = ColorPickerValueText;
exports.ColorPickerView = ColorPickerView;
exports.useColorPickerStyles = useColorPickerStyles;
