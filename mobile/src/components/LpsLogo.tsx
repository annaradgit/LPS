import React from 'react';
import Svg, {Path, Rect, Text as SvgText} from 'react-native-svg';
import {colors} from '../theme';

export function LpsLogo({small = false}: {small?: boolean}) {
  const width = small ? 120 : 180;
  const height = small ? 76 : 110;
  return (
    <Svg width={width} height={height} viewBox="0 0 180 110">
      <Path d="M35 48 L90 8 L145 48 L135 48 L135 82 L45 82 L45 48 Z" fill="none" stroke={colors.primary} strokeWidth="6" strokeLinejoin="round"/>
      <Rect x="78" y="29" width="10" height="10" rx="1" fill={colors.primary}/>
      <Rect x="92" y="29" width="10" height="10" rx="1" fill={colors.primary}/>
      <Rect x="78" y="43" width="10" height="10" rx="1" fill={colors.primary}/>
      <Rect x="92" y="43" width="10" height="10" rx="1" fill={colors.primary}/>
      <Path d="M47 55 C26 44 15 57 28 72 C38 84 54 89 73 88" fill="none" stroke={colors.primary} strokeWidth="8" strokeLinecap="round"/>
      <Path d="M133 55 C154 44 165 57 152 72 C142 84 126 89 107 88" fill="none" stroke={colors.primary} strokeWidth="8" strokeLinecap="round"/>
      <SvgText x="90" y="75" textAnchor="middle" fontSize="30" fontWeight="800" fill={colors.text}>LPS</SvgText>
    </Svg>
  );
}