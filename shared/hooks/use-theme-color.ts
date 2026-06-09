import { Colors, DarkColors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

type LightColorName = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: LightColorName
) {
  const { isDark } = useTheme();
  const colorFromProps = isDark ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  }
  return isDark ? DarkColors.light[colorName] : Colors.light[colorName];
}
