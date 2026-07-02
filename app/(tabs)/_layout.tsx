import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions, type ColorValue } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Screen, ScreenContainer } from 'react-native-screens';
import { useTabsWithTriggers } from 'expo-router/ui';

const TAB_ITEMS = [
  { name: 'index', title: 'Home', icon: 'home', href: '/(tabs)' },
  { name: 'workout', title: 'Workout', icon: 'barbell', href: '/(tabs)/workout' },
  { name: 'exercises', title: 'Exercises', icon: 'list', href: '/(tabs)/exercises' },
  { name: 'progress', title: 'Progress', icon: 'trending-up', href: '/(tabs)/progress' },
  { name: 'profile', title: 'Profile', icon: 'person', href: '/(tabs)/profile' },
] as const;

type TabRoute = (typeof TAB_ITEMS)[number]['name'];
type SwipeDirection = 'previous' | 'next' | null;

const BACKGROUND = '#000000';

function getDirection(fromIndex: number, toIndex: number): SwipeDirection {
  if (toIndex === fromIndex) return null;
  return toIndex > fromIndex ? 'next' : 'previous';
}

function TabPill({
  icon,
  color,
  focused,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: focused ? '#0076FC' : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: focused ? '#0076FC' : 'transparent',
        shadowOpacity: focused ? 0.24 : 0,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <Ionicons name={icon} size={20} color={focused ? '#FFFFFF' : color} />
    </View>
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [loadedRouteKeys, setLoadedRouteKeys] = useState<Record<string, boolean>>({});
  const pendingDirectionRef = useRef<SwipeDirection>(null);

  const { state, descriptors, navigation, NavigationContent } = useTabsWithTriggers({
    triggers: TAB_ITEMS.map((tab) => ({ type: 'internal' as const, name: tab.name, href: tab.href })),
  });

  const activeRoute = state.routes[state.index];
  const activeNavigatorIndex = state.index;
  const activeRouteKey = activeRoute?.key;
  const activeTabName = (activeRoute?.name ?? 'index') as TabRoute;
  const activeTabOrderIndex = TAB_ITEMS.findIndex((tab) => tab.name === activeTabName);

  const getNavigatorIndexForTab = (name: TabRoute) => state.routes.findIndex((route) => route.name === name);
  const getTabForOrderIndex = (index: number) => TAB_ITEMS[index]?.name;
  const tabNamesByOrder = TAB_ITEMS.map((tab) => tab.name);
  const navigatorIndexByOrder = tabNamesByOrder.map((name) => state.routes.findIndex((route) => route.name === name));

  const translateX = useSharedValue(0);
  const currentScale = useSharedValue(1);
  const currentOpacity = useSharedValue(1);
  const adjacentBaseOffset = useSharedValue(width);
  const adjacentOpacity = useSharedValue(0.98);
  const isTransitioning = useSharedValue(false);
  const gesturePreviewIndex = useSharedValue(-1);

  useEffect(() => {
    if (!activeRouteKey) return;
    setLoadedRouteKeys((current) => (current[activeRouteKey] ? current : { ...current, [activeRouteKey]: true }));
  }, [activeRouteKey]);

  useEffect(() => {
    translateX.value = 0;
    currentOpacity.value = 1;
    currentScale.value = 1;
    adjacentOpacity.value = 0.98;
    isTransitioning.value = false;
    gesturePreviewIndex.value = -1;
    setPreviewIndex(null);

    pendingDirectionRef.current = null;
  }, [activeNavigatorIndex, adjacentOpacity, currentOpacity, currentScale, gesturePreviewIndex, isTransitioning, translateX]);

  const markPreviewLoaded = (index: number | null) => {
    if (index === null) return;
    const route = state.routes[index];
    if (!route) return;
    setLoadedRouteKeys((current) => (current[route.key] ? current : { ...current, [route.key]: true }));
  };

  const clearPreview = () => {
    setPreviewIndex(null);
  };

  const jumpToIndex = (orderIndex: number) => {
    const targetName = getTabForOrderIndex(orderIndex);
    if (!targetName) return;

    if (typeof navigation.jumpTo === 'function') {
      navigation.jumpTo(targetName);
      return;
    }

    navigation.navigate(targetName);
  };

  const commitToIndex = (orderIndex: number, direction: SwipeDirection) => {
    pendingDirectionRef.current = direction;
    jumpToIndex(orderIndex);
  };

  const startTapTransition = (targetIndex: number) => {
    if (targetIndex === activeTabOrderIndex) return;

    const direction = getDirection(activeTabOrderIndex, targetIndex);
    if (!direction) return;

    const exitX = direction === 'next' ? -width : width;
    const previewRouteIndex = getNavigatorIndexForTab(getTabForOrderIndex(targetIndex)!);

    markPreviewLoaded(previewRouteIndex);
    setPreviewIndex(previewRouteIndex);
    adjacentBaseOffset.value = direction === 'next' ? width : -width;
    isTransitioning.value = true;
    gesturePreviewIndex.value = -1;

    translateX.value = withTiming(
      exitX,
      {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(commitToIndex)(targetIndex, direction);
        }
      }
    );
    currentOpacity.value = withTiming(0.88, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
    currentScale.value = withTiming(0.985, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
    adjacentOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  };

  const currentSceneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: currentScale.value }],
    opacity: currentOpacity.value,
  }));

  const adjacentSceneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + adjacentBaseOffset.value }],
    opacity: adjacentOpacity.value,
  }));

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-30, 30])
        .failOffsetY([-20, 20])
        .onUpdate(({ translationX }) => {
          if (isTransitioning.value) return;

          const direction = translationX < 0 ? 'next' : 'previous';
          const targetOrderIndex = direction === 'next' ? activeTabOrderIndex + 1 : activeTabOrderIndex - 1;
          const targetIndex = navigatorIndexByOrder[targetOrderIndex] ?? -1;
          const targetExists = targetOrderIndex >= 0 && targetOrderIndex < TAB_ITEMS.length && targetIndex >= 0;
          const dampedTranslation = targetExists ? translationX : translationX * 0.18;
          const progress = Math.min(Math.abs(dampedTranslation) / Math.max(width, 1), 1);

          if (targetExists) {
            adjacentBaseOffset.value = direction === 'next' ? width : -width;
            if (gesturePreviewIndex.value !== targetIndex) {
              gesturePreviewIndex.value = targetIndex;
              runOnJS(markPreviewLoaded)(targetIndex);
              runOnJS(setPreviewIndex)(targetIndex);
            }
          } else if (gesturePreviewIndex.value !== -1) {
            gesturePreviewIndex.value = -1;
            runOnJS(clearPreview)();
          }

          translateX.value = dampedTranslation;
          currentOpacity.value = 1 - progress * 0.1;
          currentScale.value = 1 - progress * 0.015;
          adjacentOpacity.value = 0.92 + progress * 0.08;
        })
        .onEnd(({ translationX, velocityX }) => {
          if (isTransitioning.value) return;

          const direction = translationX < 0 ? 'next' : 'previous';
          const targetOrderIndex = direction === 'next' ? activeTabOrderIndex + 1 : activeTabOrderIndex - 1;
          const targetIndex = navigatorIndexByOrder[targetOrderIndex] ?? -1;
          const targetExists = targetOrderIndex >= 0 && targetOrderIndex < TAB_ITEMS.length && targetIndex >= 0;
          const passedDistance = Math.abs(translationX) > width * 0.22;
          const passedVelocity = Math.abs(velocityX) > 650;

          if (!targetExists || (!passedDistance && !passedVelocity)) {
            gesturePreviewIndex.value = -1;
            translateX.value = withTiming(0, {
              duration: 260,
              easing: Easing.out(Easing.cubic),
            });
            currentOpacity.value = withTiming(1, {
              duration: 220,
              easing: Easing.out(Easing.quad),
            });
            currentScale.value = withTiming(1, {
              duration: 260,
              easing: Easing.out(Easing.cubic),
            });
            adjacentOpacity.value = withTiming(0.98, {
              duration: 180,
              easing: Easing.out(Easing.quad),
            });
            runOnJS(clearPreview)();
            return;
          }

          const exitX = direction === 'next' ? -width : width;
          isTransitioning.value = true;
          gesturePreviewIndex.value = -1;
          runOnJS(setPreviewIndex)(targetIndex);
          adjacentBaseOffset.value = direction === 'next' ? width : -width;

          translateX.value = withTiming(
            exitX,
            {
              duration: 240,
              easing: Easing.out(Easing.cubic),
            },
            (finished) => {
              if (finished) {
                runOnJS(commitToIndex)(targetOrderIndex, direction);
              }
            }
          );
          currentOpacity.value = withTiming(0.88, {
            duration: 180,
            easing: Easing.out(Easing.quad),
          });
          currentScale.value = withTiming(0.985, {
            duration: 240,
            easing: Easing.out(Easing.cubic),
          });
          adjacentOpacity.value = withTiming(1, {
            duration: 180,
            easing: Easing.out(Easing.quad),
          });
        }),
    [activeTabOrderIndex, adjacentBaseOffset, adjacentOpacity, currentOpacity, currentScale, isTransitioning, navigatorIndexByOrder, translateX, width]
  );

  const renderedScenes = state.routes.map((route, index) => {
    const descriptor = descriptors[route.key];
    const isActive = index === activeNavigatorIndex;
    const isPreview = index === previewIndex;
    const shouldRender = loadedRouteKeys[route.key] || isActive || isPreview;

    if (!descriptor || !shouldRender) return null;

    const animatedStyle = isActive ? currentSceneStyle : isPreview ? adjacentSceneStyle : undefined;

    return (
      <Screen
        key={route.key}
        activityState={isActive ? 2 : isPreview ? 1 : 0}
        style={[
          styles.scene,
          isActive && styles.activeScene,
          isPreview && styles.previewScene,
          !isActive && !isPreview && styles.hiddenScene,
        ]}
      >
        <Animated.View
          pointerEvents={isActive ? 'auto' : 'none'}
          style={[
            styles.sceneContent,
            { backgroundColor: BACKGROUND },
            animatedStyle,
          ]}
        >
          {descriptor.render()}
        </Animated.View>
      </Screen>
    );
  });

  return (
    <NavigationContent>
      <View style={styles.root}>
        <GestureDetector gesture={swipeGesture}>
          <View style={styles.sceneViewport}>
            <ScreenContainer enabled={false} style={styles.screenContainer}>
              {renderedScenes}
            </ScreenContainer>
          </View>
        </GestureDetector>

        <View style={styles.tabBar}>
          {TAB_ITEMS.map((tab, index) => {
            const focused = activeTabOrderIndex === index;
            return (
              <Pressable
                key={tab.name}
                accessibilityRole="button"
                onPress={() => startTapTransition(index)}
                style={styles.tabButton}
              >
                <TabPill
                  icon={tab.icon}
                  color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                  focused={focused}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </NavigationContent>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  sceneViewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: BACKGROUND,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scene: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKGROUND,
  },
  sceneContent: {
    flex: 1,
  },
  activeScene: {
    zIndex: 2,
  },
  previewScene: {
    zIndex: 1,
  },
  hiddenScene: {
    zIndex: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: Platform.OS === 'ios' ? 76 : 68,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(17,17,17,0.94)',
    shadowColor: '#0076FC',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tabButton: {
    height: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
