import React from 'react';
import {ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle} from 'react-native';
import {colors, shadow} from '../theme';

export function Button({title, onPress, secondary = false, disabled = false, style}: {title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.disabled, style]}>
      {disabled ? <ActivityIndicator color={secondary ? colors.primary : '#fff'} /> : <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>}
    </Pressable>
  );
}

export function Card({children, style}: {children: React.ReactNode; style?: StyleProp<ViewStyle>}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({label, ...props}: TextInputProps & {label: string}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} placeholderTextColor="#A29A93" style={styles.input} />
    </View>
  );
}

export function Badge({text, tone = 'neutral'}: {text: string; tone?: 'neutral' | 'success' | 'warning' | 'danger'}) {
  const map = {
    neutral: {bg: '#F1ECE7', fg: colors.text},
    success: {bg: colors.successSoft, fg: colors.success},
    warning: {bg: colors.warningSoft, fg: colors.warning},
    danger: {bg: colors.dangerSoft, fg: colors.danger},
  };
  const c = map[tone];
  return <View style={[styles.badge, {backgroundColor: c.bg}]}><Text style={[styles.badgeText, {color: c.fg}]}>{text}</Text></View>;
}

export const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20, paddingBottom: 40},
  title: {fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8},
  subtitle: {fontSize: 15, lineHeight: 22, color: colors.muted},
  card: {backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 14, ...shadow},
  button: {minHeight: 52, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
  buttonSecondary: {backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary},
  buttonText: {fontSize: 16, fontWeight: '800', color: '#fff'},
  buttonTextSecondary: {color: colors.primaryDark},
  disabled: {opacity: 0.6},
  fieldWrap: {marginBottom: 15},
  label: {fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 7},
  input: {backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 14, minHeight: 50, color: colors.text, fontSize: 15},
  badge: {alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6},
  badgeText: {fontSize: 12, fontWeight: '800'},
});