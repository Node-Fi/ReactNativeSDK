import { Dimensions, StyleSheet } from 'react-native';

import { getColor } from './colors';

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const red = '#F27776';
const green = '#52CD85';

export const themes = {
  light: {
    screenBackground: '#F8F7F7', //"hsl(0, 7%, 97%, 1.0)",
    menuBackground: 'hsl(0, 0%, 0%, 1.0)',
    text: '#2E3338', //"hsla(0, 0%, 0%, 1.0)",
    cardBackground: 'hsla(0, 0%, 100%, 1.0)',
    cardShadow: 'hsla(0, 0%, 50%, 1.0)',
    cardSectionBackground: 'hsla(0, 0%, 0%, 0.04)',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    separator: 'hsla(0, 0%, 0%, 0.1)',
    sliderTrack: 'hsla(0, 0%, 0%, 0.1)',
    sliderTrackTint: tintColorLight,
    inputBackground: 'hsla(0, 0%, 0%, 0.04)',
    buttonBackground: 'blue', // 'hsla(190, 40%, 90%, 1.0)'
    buttonText: 'white',
    accent1: '#1717FC',
    accent2: getColor('green', 1),
    bg2: '#DEDEDE',
    red,
    green,
  },
  dark: {
    screenBackground: 'hsla(230, 28%, 14%, 1.0)', // hsla(230, 28%, 25%, 1.0)
    menuBackground: 'hsla(230, 28%, 11%, 1.0)',
    text: 'hsla(230, 50%, 90%, 1.0)',
    cardBackground: 'hsla(230, 23%, 19%, 1.0)', // 'hsla(0, 0%, 10%, 1.0)'
    cardShadow: 'hsla(0, 0%, 8%, 1.0)', // 'hsla(0, 0%, 30%, 1.0)'
    cardSectionBackground: 'hsla(0, 0%, 0%, 0.15)', // 'hsla(0, 0%, 0%, 0.5)'
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    separator: 'hsla(0, 0%, 100%, 0.1)',
    sliderTrackTint: tintColorDark,
    sliderTrack: 'hsla(0, 0%, 100%, 0.1)',
    inputBackground: 'hsla(0, 0%, 100%, 0.1)',
    buttonBackground: 'blue', //"hsla(210, 20%, 28%, 1.0)", // 'hsla(210, 30%, 20%, 1.0)'
    buttonText: 'hsla(0, 0%, 100%, 0.9)',
    accent1: '#1717FC',
    accent2: '#45CD85',
    bg2: '#DEDEDE',
    red,
    green,
  },
};

const fontFamily = 'Avenir'; //"Avenir-Regular";
export const text = StyleSheet.create({
  baseText: {
    fontFamily,
  },
  h1: {
    fontSize: 24,
    lineHeight: 24 * 1.2,
    fontWeight: 'bold',
    fontFamily,
  },
  h2: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: 'bold',
    fontFamily,
  },
  h3: {
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontWeight: 'bold',
    fontFamily,
  },
  p: {
    fontSize: 16,
    lineHeight: 16 * 1.3,
    fontFamily,
    opacity: 0.7,
  },
  caption: {
    fontSize: 11,
    lineHeight: 11 * 1.4,
    opacity: 0.6,
    fontFamily,
  },
  strong: {
    fontWeight: 'bold',
    fontFamily,
  },
  code: {
    // fontFamily: "space-mono",
  },
  center: {
    textAlign: 'center',
  },
  number: {
    fontSize: 19,
    lineHeight: 19 * 1.2,
    fontWeight: 'bold',
    fontFamily,
    // // fontFamily: 'space-mono'
  },
  address: {
    // fontFamily: "space-mono",
    fontSize: 12,
    lineHeight: 12 * 2,
  },
  accent: {
    color: getColor('green', 0.8),
  },
});

export const DEVICE_WIDTH = Dimensions.get('screen').width;
export const DEVICE_HEIGHT = Dimensions.get('screen').height;

const containerSpacing = 18;
const containerInnerSpacing = 36;
const cardShadowDepth = 3;
const cardSpacing = 18;
const cardSectionSpacing = 16;
const listSpacing = 16;
const gridGap = 8;
const gridItemSize = 140;
const shadowDepth = 3;
const borderWidth = 1;
const maxWidth = Dimensions.get('screen').width * 0.9;

export const layout = StyleSheet.create({
  outerContainer: {
    width: maxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: -gridGap,
  },
  gridItem: {
    width: gridItemSize,
    flexBasis: gridItemSize,
    height: gridItemSize,
    margin: gridGap,
  },
  full: {
    flex: 1,
    alignSelf: 'stretch',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  hr: {
    marginVertical: 20,
    height: 1,
    width: '100%',
  },
  spacer: {
    width: 0,
    height: 0,
    margin: 6,
  },
  sectionSpacer: {
    margin: containerInnerSpacing / 2,
    backgroundColor: 'transparent',
  },
  cardWrapper: {
    margin: -cardShadowDepth * 2,
    padding: cardShadowDepth * 2,
    zIndex: 1,
  },
  card: {
    borderRadius: cardSpacing,
    padding: cardSpacing,
    maxWidth: '100%',
    borderColor: getColor('black', 0.1),
    borderWidth,
  },
  cardWithShadow: {
    shadowOffset: {
      width: cardShadowDepth,
      height: cardShadowDepth,
    },
    shadowRadius: cardShadowDepth,
    shadowOpacity: 0.25,
    elevation: cardShadowDepth,
    borderWidth: 0,
  },
  cardList: {
    margin: -cardSpacing,
  },
  cardSection: {
    borderRadius: cardSectionSpacing,
    padding: cardSectionSpacing,
  },
  listItem: {
    paddingVertical: listSpacing,
  },
  listSeparator: {
    height: 1,
    marginHorizontal: listSpacing,
    width: '100%',
  },
  cardListItem: {
    paddingHorizontal: cardSpacing,
  },
  cardListItemToggleContent: {
    padding: cardSpacing,
    paddingTop: 0,
  },
  container: {
    padding: containerSpacing,
    backgroundColor: 'transparent',
  },
  bordered: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  shadowed: {
    shadowOffset: {
      width: 0,
      height: shadowDepth,
    },
    shadowRadius: shadowDepth,
    shadowOpacity: 0.45,
    elevation: shadowDepth,
  },
  shadowedDeep: {
    shadowOffset: {
      width: 0,
      height: 100,
    },
    shadowRadius: 100,
    shadowOpacity: 0.5,
    elevation: 100,
  },
  assetIcon: {
    width: 45,
    height: 45,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundedButton: {
    borderRadius: 22,
    paddingVertical: 17,
    paddingHorizontal: 22,
  },
  buttonText: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  buttonSmall: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonSmallText: {
    fontSize: 11,
  },
  buttonIcon: {
    width: 18,
    height: 18,
    // transform: [{ translateX: -4 }],
    // marginRight: 2
    transform: [{ translateX: -3 }],
    marginRight: 4,
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  input: {
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
  slider: {
    height: 24,
  },
  sliderThumb: {
    width: 20,
    height: 20,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'black',
    marginRight: 5,
    marginLeft: 5,
  },
});
