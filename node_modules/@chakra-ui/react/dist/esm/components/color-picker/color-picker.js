"use strict";
"use client";
import { ColorPicker } from '@ark-ui/react/color-picker';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';

const {
  withProvider,
  withContext,
  useStyles: useColorPickerStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "colorPicker" });
const ColorPickerRootProvider = withProvider(ColorPicker.RootProvider, "root", { forwardAsChild: true });
const ColorPickerRoot = withProvider(ColorPicker.Root, "root", { forwardAsChild: true });
const ColorPickerPropsProvider = PropsProvider;
const ColorPickerLabel = withContext(ColorPicker.Label, "label", { forwardAsChild: true });
const ColorPickerControl = withContext(ColorPicker.Control, "control", { forwardAsChild: true });
const ColorPickerTrigger = withContext(ColorPicker.Trigger, "trigger", { forwardAsChild: true });
const ColorPickerPositioner = withContext(ColorPicker.Positioner, "positioner", { forwardAsChild: true });
const ColorPickerContent = withContext(ColorPicker.Content, "content", { forwardAsChild: true });
const ColorPickerArea = withContext(ColorPicker.Area, "area", { forwardAsChild: true });
const ColorPickerAreaBackground = withContext(ColorPicker.AreaBackground, "areaBackground", { forwardAsChild: true });
const ColorPickerAreaThumb = withContext(ColorPicker.AreaThumb, "areaThumb", { forwardAsChild: true });
const ColorPickerChannelSlider = withContext(ColorPicker.ChannelSlider, "channelSlider", { forwardAsChild: true });
const ColorPickerChannelSliderTrack = withContext(ColorPicker.ChannelSliderTrack, "channelSliderTrack", {
  forwardAsChild: true
});
const ColorPickerChannelSliderThumb = withContext(ColorPicker.ChannelSliderThumb, "channelSliderThumb", {
  forwardAsChild: true
});
const ColorPickerChannelInput = withContext(ColorPicker.ChannelInput, "channelInput", { forwardAsChild: true });
const ColorPickerTransparencyGrid = withContext(ColorPicker.TransparencyGrid, "transparencyGrid", { forwardAsChild: true });
const ColorPickerSwatchGroup = withContext(ColorPicker.SwatchGroup, "swatchGroup", { forwardAsChild: true });
const ColorPickerSwatchTrigger = withContext(ColorPicker.SwatchTrigger, "swatchTrigger", { forwardAsChild: true });
const ColorPickerSwatch = withContext(ColorPicker.Swatch, "swatch", { forwardAsChild: true });
const ColorPickerSwatchIndicator = withContext(ColorPicker.SwatchIndicator, "swatchIndicator", { forwardAsChild: true });
const ColorPickerValueText = withContext(ColorPicker.ValueText, "valueText", { forwardAsChild: true });
const ColorPickerValueSwatch = withContext(ColorPicker.ValueSwatch, "swatch", { forwardAsChild: true });
const ColorPickerView = withContext(ColorPicker.View, "view", { forwardAsChild: true });
const ColorPickerFormatTrigger = withContext(ColorPicker.FormatTrigger, "formatTrigger", { forwardAsChild: true });
const ColorPickerFormatSelect = withContext(ColorPicker.FormatSelect, "formatSelect", { forwardAsChild: true });
const ColorPickerEyeDropperTrigger = withContext(ColorPicker.EyeDropperTrigger, "eyeDropperTrigger", {
  forwardAsChild: true
});
const ColorPickerChannelSliderValueText = withContext(ColorPicker.ChannelSliderValueText, "channelSliderValueText", {
  forwardAsChild: true
});
const ColorPickerChannelSliderLabel = withContext(ColorPicker.ChannelSliderLabel, "channelSliderLabel", {
  forwardAsChild: true
});
const ColorPickerHiddenInput = ColorPicker.HiddenInput;
const ColorPickerContext = ColorPicker.Context;

export { ColorPickerArea, ColorPickerAreaBackground, ColorPickerAreaThumb, ColorPickerChannelInput, ColorPickerChannelSlider, ColorPickerChannelSliderLabel, ColorPickerChannelSliderThumb, ColorPickerChannelSliderTrack, ColorPickerChannelSliderValueText, ColorPickerContent, ColorPickerContext, ColorPickerControl, ColorPickerEyeDropperTrigger, ColorPickerFormatSelect, ColorPickerFormatTrigger, ColorPickerHiddenInput, ColorPickerLabel, ColorPickerPositioner, ColorPickerPropsProvider, ColorPickerRoot, ColorPickerRootProvider, ColorPickerSwatch, ColorPickerSwatchGroup, ColorPickerSwatchIndicator, ColorPickerSwatchTrigger, ColorPickerTransparencyGrid, ColorPickerTrigger, ColorPickerValueSwatch, ColorPickerValueText, ColorPickerView, useColorPickerStyles };
