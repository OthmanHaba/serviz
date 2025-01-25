import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import Animated, { 
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const slides = [
  {
    title: 'Welcome to Serviz',
    description: 'Your roadside assistance companion, available 24/7.',
  },
  {
    title: 'Quick & Reliable',
    description: 'Get connected with nearby service providers in minutes.',
  },
  {
    title: 'Choose Your Role',
    description: 'Are you looking for assistance or providing services?',
  },
];

export default function Onboarding() {
  const { width: screenWidth } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onNextPress = () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * screenWidth,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onRoleSelect = (role: 'user' | 'provider') => {
    // TODO: Store role selection
    router.replace('/register');
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View
            key={index}
            style={[styles.slide, { width: screenWidth }]}
          >
            <Text variant="headlineLarge" style={styles.title}>
              {slide.title}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {slide.description}
            </Text>

            {index === slides.length - 1 && (
              <View style={styles.roleButtons}>
                <Button
                  mode="contained"
                  onPress={() => onRoleSelect('user')}
                  style={styles.roleButton}
                >
                  I Need Assistance
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => onRoleSelect('provider')}
                  style={styles.roleButton}
                >
                  I'm a Service Provider
                </Button>
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {currentIndex < slides.length - 1 && (
        <Button
          mode="contained"
          onPress={onNextPress}
          style={styles.nextButton}
        >
          Next
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2563EB',
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2563EB',
    width: 20,
  },
  nextButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  roleButtons: {
    width: '100%',
    paddingHorizontal: 20,
  },
  roleButton: {
    marginVertical: 10,
  },
}); 