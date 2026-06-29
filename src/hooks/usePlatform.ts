import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export const IS_WEB = Platform.OS === 'web';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export function usePlatform() {
  const { width, height } = useWindowDimensions();

  return {
    isWeb: IS_WEB,
    isNative: !IS_WEB,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    width,
    height,
  };
}

export function useMediaQuery(query: 'mobile' | 'tablet' | 'desktop') {
  const { width } = useWindowDimensions();

  switch (query) {
    case 'mobile':
      return width < BREAKPOINTS.tablet;
    case 'tablet':
      return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    case 'desktop':
      return width >= BREAKPOINTS.desktop;
  }
}

export function useIsDesktopWeb() {
  const { isWeb, isDesktop } = usePlatform();
  return isWeb && isDesktop;
}
