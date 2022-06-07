import * as React from 'react';
import {
  Image as DefaultImage,
  SliderComponent as DefaultSlider,
  Text as DefaultText,
  TextInput as DefaultTextInput,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Animated } from 'react-native';

import { getColor } from '../styles/colors';
import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  layout,
  text,
  themes,
} from '../styles/styles';

type LightProps = {
  readonly light?: string;
  readonly dark?: string;
  readonly opacity?: number;
};

export function useThemeColor(
  props: LightProps,
  colorName: keyof typeof themes.light & keyof typeof themes.dark
) {
  const theme = 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return !props.opacity
      ? colorFromProps
      : getColor(colorFromProps, props.opacity ?? 1);
  } else {
    return themes[theme][colorName];
  }
}

type ThemeProps = {
  readonly lightColor?: string;
  readonly darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & View['props'];
export type ImageProps = ThemeProps & DefaultImage['props'];
export type CardProps = ViewProps & {
  readonly outerStyle?: StyleProp<ViewStyle>;
  readonly noShadow?: boolean;
};
export type BackgroundProps = {
  readonly icon?: any;
  readonly background?: LightProps;
  readonly textOverride?: LightProps;
};

export function Text({ style, lightColor, darkColor, ...props }: TextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...props} />;
}

export function Container({
  style,
  lightColor,
  darkColor,
  ...props
}: ViewProps) {
  return <View style={[layout.container, layout.column, style]} {...props} />;
}

export const InfoRow = ({ left, right }: { readonly left: string; readonly right: string }) => (
  <View style={[layout.row, layout.spaceBetween]}>
    <Text style={{ opacity: 0.75 }}>{left}</Text>
    <Text>{right}</Text>
  </View>
);

export function SlidingUnderCard({
  style,
  outerStyle,
  lightColor,
  darkColor,
  children,
  noShadow,
  show,
  ...props
}: CardProps & { readonly show?: boolean }) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'cardBackground'
  );
  const shadowColor = useThemeColor({}, 'cardShadow');

  const position = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const toValue = show ? 1 : 0;
    Animated.timing(position, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [position, show]);

  return (
    <Animated.View
      style={[
        layout.card,
        layout.cardWithShadow,
        {
          paddingTop: position.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '15%'],
          }),
          position: 'relative',
          top: position.interpolate({
            inputRange: [0, 1],
            outputRange: ['-20%', '-10%'],
          }),
          // top: 0, //"-10%",
          zIndex: 0,
          backgroundColor,
          shadowColor,
          overflow: 'hidden',
          maxHeight: position.interpolate({
            inputRange: [0, 1],
            outputRange: [0, DEVICE_HEIGHT],
          }),
          marginBottom: 0,
          elevation: 0,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Card({
  style,
  outerStyle,
  lightColor,
  darkColor,
  children,
  noShadow,
  ...props
}: CardProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'cardBackground'
  );
  const shadowColor = useThemeColor({}, 'cardShadow');

  return (
    <View style={[layout.cardWrapper, outerStyle]}>
      <View
        children={children}
        style={[
          layout.card,
          { backgroundColor, shadowColor, overflow: 'hidden' },
          style,
        ]}
      />
    </View>
  );
}

export function ColorCard({
  style,
  outerStyle,
  lightColor,
  darkColor,
  children,
  noShadow,
  color,
  onPress,
  colorOpacity,
  ...props
}: CardProps & { readonly color: string; readonly onPress?: () => void; readonly colorOpacity?: number }) {
  const backgroundColor = useThemeColor(
    {
      light: getColor(color, colorOpacity ?? 0.2),
      dark: getColor(color, colorOpacity ?? 0.2),
    },
    'cardBackground'
  );
  const shadowColor = useThemeColor({}, 'cardShadow');

  return (
    <TouchableOpacity
      style={[layout.cardWrapper, outerStyle]}
      onPress={onPress}
      {...props}
    >
      <View
        children={children}
        style={[
          layout.card,
          {
            backgroundColor,
            shadowColor,
            overflow: 'hidden',
            borderColor: getColor(color, 1),
          },
          style,
        ]}
      />
    </TouchableOpacity>
  );
}

export function CenterThree({
  left,
  right,
  style,
  children,
  ...props
}: ViewProps & { readonly left: number; readonly right: number }) {
  return (
    <View style={[{ position: 'relative' }, style]} {...props}>
      <View style={{ position: 'absolute', left }} children={children[0]} />
      <View
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
        children={children[1]}
      />
      <View style={{ position: 'absolute', right }} children={children[2]} />
    </View>
  );
}

export function CardSection({
  style,
  lightColor,
  darkColor,
  ...props
}: ViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'cardSectionBackground'
  );

  return (
    <View style={layout.cardWrapper}>
      <View
        style={[layout.cardSection, { backgroundColor }, style]}
        {...props}
      />
    </View>
  );
}

export function Separator({
  style,
  lightColor,
  darkColor,
  ...props
}: ViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'separator'
  );

  return <View style={[layout.hr, { backgroundColor }, style]} {...props} />;
}

export function ListSeparator({
  style,
  lightColor,
  darkColor,
  ...props
}: ViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'separator'
  );

  return (
    <View
      style={[layout.listSeparator, { backgroundColor }, style]}
      {...props}
    />
  );
}

export function Spacer() {
  return <View style={layout.spacer} />;
}

export function SectionSpacer() {
  return <View style={layout.sectionSpacer} />;
}

export function Image({ style, resizeMode = 'contain', ...props }: ImageProps) {
  return (
    <DefaultImage
      style={[layout.img, style]}
      resizeMode={resizeMode}
      {...props}
    />
  );
}
export function ButtonConfirm({
  style,
  children,
  background,
  textOverride,
  width,
  disabled,
  shadow,
  ...props
}: BackgroundProps &
  TextProps &
  ThemeProps &
  TouchableOpacity['props'] & { readonly width?: number; readonly shadow?: boolean }) {
  const backgroundColor = useThemeColor(background || {}, 'buttonBackground');
  const textColor = useThemeColor(textOverride || {}, 'buttonText');
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        // layout.button,
        shadow ? layout.cardWithShadow : {},
        {
          display: 'flex',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderRadius: (width ?? 0) * 0.5,
          paddingVertical: 15,
        },
        style,

        disabled ? { backgroundColor: getColor('disabled', 1) } : {},
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

export function NodeButton({
  style,
  children,
  background,
  textOverride,
  textStyle,
  text: textVal,
  noShadow,
  width,
  disabled,
  ...props
}: BackgroundProps &
  TextProps &
  ThemeProps &
  TouchableOpacity['props'] & {
    readonly width?: number;
    readonly noShadow?: boolean;
    readonly text?: string;
    readonly textStyle?: TextStyle;
  }) {
  const backgroundColor = useThemeColor(background || {}, 'buttonBackground');
  const textColor = useThemeColor(textOverride || {}, 'buttonText');

  return (
    <ButtonConfirm
      style={[
        {
          backgroundColor: getColor(disabled ? 'disabled' : backgroundColor, 1),
          width: width ?? DEVICE_WIDTH * 0.9,
          borderRadius: 16,
        },
        style,
      ]}
      disabled={disabled}
      shadow={!noShadow}
      {...props}
    >
      <Text
        adjustsFontSizeToFit={true}
        style={[
          text.h2,
          {
            color: textColor,
            fontWeight: '900',
            textTransform: 'uppercase',
            textAlignVertical: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
          },
          textStyle,
        ]}
      >
        {textVal}
      </Text>
    </ButtonConfirm>
  );
}

export function Button({
  style,
  icon,
  children,
  background,
  textOverride,
  containerStyle,
  ...props
}: BackgroundProps &
  TextProps &
  ThemeProps &
  TouchableOpacity['props'] & { readonly containerStyle: ViewStyle }) {
  const backgroundColor = useThemeColor(background || {}, 'buttonBackground');
  const textColor = useThemeColor(textOverride || {}, 'buttonText');

  return (
    <TouchableOpacity
      style={[layout.button, { backgroundColor }, containerStyle]}
      {...props}
    >
      {icon && <Image style={layout.buttonIcon} source={icon} />}
      <Text style={[layout.buttonText, { color: textColor }, style]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function RoundedButton({
  style,
  icon,
  children,
  background,
  textOverride,
  containerStyle,
  ...props
}: BackgroundProps &
  TextProps &
  ThemeProps &
  TouchableOpacity['props'] & { readonly containerStyle: ViewStyle }) {
  const backgroundColor = useThemeColor(background || {}, 'buttonBackground');
  const textColor = useThemeColor(textOverride || {}, 'buttonText');

  return (
    <TouchableOpacity
      style={[
        layout.button,
        layout.roundedButton,
        { backgroundColor },
        containerStyle,
      ]}
      {...props}
    >
      {icon && <Image style={layout.buttonIcon} source={icon} />}
      <Text style={[layout.buttonText, { color: textColor }, style]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export const TradeDetailRow = ({
  label,
  detail,
  style,
}: {
  readonly label: string;
  readonly detail: string;
} & ViewProps) => (
  <View
    style={[layout.row, layout.spaceBetween, { paddingHorizontal: 3 }, style]}
  >
    <Text
      style={[
        text.caption,
        {
          fontSize: text.caption.fontSize * 1.2,
        },
      ]}
    >
      {label}:
    </Text>
    <Text style={[text.h3, { fontSize: 14, opacity: 0.6 }]}>{detail}</Text>
  </View>
);

export function ButtonSmall({
  style,
  icon,
  children,
  containerStyle,
  ...props
}: TextProps &
  TouchableOpacity['props'] & { readonly containerStyle: ViewStyle; readonly icon: ImageProps }) {
  const backgroundColor = useThemeColor({}, 'buttonBackground');
  const textColor = useThemeColor({}, 'buttonText');

  return (
    <TouchableOpacity
      style={[
        layout.button,
        layout.buttonSmall,
        { backgroundColor, borderRadius: 10 },
        containerStyle,
      ]}
      {...props}
    >
      {icon && <Image style={layout.buttonIcon} source={icon} />}
      <Text
        style={[
          layout.buttonText,
          layout.buttonSmallText,
          { color: textColor },
          style,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function Slider({
  style,
  lightColor,
  value,
  darkColor,
  tintColor,
  thumbImage,
  showValues,
  onValueChange,
  ...props
}: {
  readonly tintColor: string;
  readonly thumbImage: string;
  readonly showValues?: boolean;
} & ThemeProps &
  DefaultSlider['props']) {
  const trackColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'sliderTrack'
  );
  const trackTintColor = useThemeColor(
    { light: tintColor, dark: tintColor },
    'sliderTrackTint'
  );

  let sliderTimeout = null;
  return (
    <>
      <DefaultSlider
        value={value}
        style={[layout.slider, style]}
        onValueChange={(val) => {
          clearTimeout(sliderTimeout);
          sliderTimeout = setTimeout(() => onValueChange(val), 1);
        }}
        minimumTrackTintColor={trackTintColor}
        maximumTrackTintColor={trackColor}
        // thumbStyle={[layout.sliderThumb, { backgroundColor: trackColor }]}
        thumbTintColor={trackColor}
        minimumValue={props.minimumValue}
        maximumValue={props.maximumValue}
      />
      {showValues ? (
        <RowBetween>
          <Text style={text.caption}>{props.minimumValue}</Text>
          <Text style={text.caption}>{props.maximumValue.toFixed(4)}</Text>
        </RowBetween>
      ) : null}
    </>
  );
}

export function TextInput({
  style,
  lightColor,
  darkColor,
  ...props
}: ThemeProps & DefaultTextInput['props']) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'inputBackground'
  );

  return (
    <DefaultTextInput
      style={[layout.input, { color, backgroundColor }, style]}
      {...props}
    />
  );
}

export function RowBetween({
  style,
  lightColor,
  darkColor,
  ...props
}: ViewProps) {
  return (
    <View
      style={[layout.row, { justifyContent: 'space-between' }, style]}
      {...props}
    />
  );
}
