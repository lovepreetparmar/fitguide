import React, { Component, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <Text className="mb-2 text-xl font-bold text-text">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </Text>
          <Text className="mb-6 text-center text-text-secondary">
            Try again. If the problem continues, restart the app.
          </Text>
          <Button title="Try again" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }

    return this.props.children;
  }
}
