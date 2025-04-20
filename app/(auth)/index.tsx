import { View, StyleSheet, useWindowDimensions, ScrollView, I18nManager } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import Animated, { 
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

// Arabic translations
const translations = {
  slides: [
    {
      title: 'طريقك الآمن',
      subtitle: 'مساعدتك على الطريق',
      description: 'احصل على مساعدة على الطريق بكل سهولة. بسط تجربة القيادة الخاصة بك.',
    },
    {
      title: 'اختر دورك',
      subtitle: 'مستخدم أو مزود خدمة',
      description: 'حدد ما إذا كنت بحاجة إلى مساعدة أو ترغب في تقديم الخدمات.',
    },
  ],
  buttons: {
    needAssistance: 'أحتاج إلى مساعدة',
    serviceProvider: 'أنا مزود خدمة',
    login: 'تسجيل الدخول',
    next: 'التالي',
    getStarted: 'البدء'
  }
};

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
    if (currentIndex < translations.slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * screenWidth,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      // On last slide, pressing next should go to role selection
      router.replace(`/register?role=user`);
    }
  };

  const onRoleSelect = (role: 'user' | 'provider') => {
    router.replace(`/register?role=${role}`);
  };

  return (
    <View style={[styles.container, { direction: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {translations.slides.map((slide, index) => (
          <View
            key={index}
            style={[styles.slide, { width: screenWidth }]}
          >
            <View style={styles.contentContainer}>
              <Text variant="headlineLarge" style={styles.title}>
                {slide.title}
              </Text>
              <Text variant="titleMedium" style={styles.subtitle}>
                {slide.subtitle}
              </Text>
              <Text variant="bodyLarge" style={styles.description}>
                {slide.description}
              </Text>

              {index === translations.slides.length - 1 && (
                <View style={styles.roleButtons}>
                  <Button
                    mode="contained"
                    onPress={() => onRoleSelect('user')}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    buttonColor="#4CAF50"
                    textColor="#FFFFFF"
                  >
                    {translations.buttons.needAssistance}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => onRoleSelect('provider')}
                    style={styles.outlinedButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    textColor="#4CAF50"
                  >
                    {translations.buttons.serviceProvider}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => router.replace('/login')}
                    style={styles.textButton}
                    labelStyle={styles.textButtonLabel}
                  >
                    {translations.buttons.login}
                  </Button>
                </View>
              )}
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={onNextPress}
          style={styles.nextButton}
          contentStyle={styles.nextButtonContent}
          labelStyle={styles.nextButtonLabel}
          buttonColor="#4CAF50"
          textColor="#FFFFFF"
        >
          {currentIndex === translations.slides.length - 1 
            ? translations.buttons.getStarted 
            : translations.buttons.next}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  roleButtons: {
    width: '100%',
    marginTop: 16,
  },
  primaryButton: {
    marginVertical: 8,
    borderRadius: 28,
    width: '100%',
    elevation: 0,
  },
  outlinedButton: {
    marginVertical: 8,
    borderRadius: 28,
    borderColor: '#4CAF50',
    width: '100%',
  },
  textButton: {
    marginTop: 8,
  },
  nextButton: {
    borderRadius: 28,
    width: '100%',
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 8,
    height: 56,
  },
  nextButtonContent: {
    paddingVertical: 8,
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  textButtonLabel: {
    fontSize: 16,
  },
  nextButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 