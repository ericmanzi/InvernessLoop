// ─── Attachment Style Quiz ────────────────────────────────────────────────────
// 10 questions that score the user's avoidant attachment tendency.
// Results feed into matching and profile display.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colors';
import { QUIZ_QUESTIONS, computeQuizResult, attachmentStyleLabel } from '../../utils/attachmentQuiz';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof computeQuizResult> | null>(null);

  const completeQuiz = useAuthStore((s) => s.completeQuiz);

  const question = QUIZ_QUESTIONS[currentIndex];
  const progress = (currentIndex / QUIZ_QUESTIONS.length) * 100;
  const isLastQuestion = currentIndex === QUIZ_QUESTIONS.length - 1;

  function selectOption(value: number) {
    setSelectedValue(value);
  }

  function advance() {
    if (selectedValue === null) return;

    const newAnswers = [...answers, selectedValue];

    if (isLastQuestion) {
      const quizResult = computeQuizResult(newAnswers);
      setResult(quizResult);
      completeQuiz(quizResult);
      setQuizComplete(true);
    } else {
      setAnswers(newAnswers);
      setCurrentIndex((prev) => prev + 1);
      setSelectedValue(null);
    }
  }

  function goBack() {
    if (currentIndex === 0) {
      router.back();
      return;
    }
    setCurrentIndex((prev) => prev - 1);
    setAnswers((prev) => prev.slice(0, -1));
    setSelectedValue(null);
  }

  if (quizComplete && result) {
    return <ResultScreen result={result} />;
  }

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.questionCounter}>
              {currentIndex + 1} / {QUIZ_QUESTIONS.length}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Question */}
            <View style={styles.questionSection}>
              <Text style={styles.questionLabel}>Question {currentIndex + 1}</Text>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsSection}>
              {question.options.map((option, idx) => {
                const isSelected = selectedValue === option.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => selectOption(option.value)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.optionDot, isSelected && styles.optionDotSelected]} />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Next button */}
          <View style={styles.footer}>
            <Button
              title={isLastQuestion ? 'See my results' : 'Continue'}
              variant="primary"
              size="lg"
              fullWidth
              disabled={selectedValue === null}
              onPress={advance}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Result screen (shown after final question) ───────────────────────────────

function ResultScreen({ result }: { result: ReturnType<typeof computeQuizResult> }) {
  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🌿</Text>
          <Text style={styles.resultTitle}>Your attachment style</Text>
          <Text style={styles.resultStyle}>{attachmentStyleLabel(result.attachmentStyle)}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Avoidant score:</Text>
            <Text style={styles.scoreValue}>{result.score} / 100</Text>
          </View>
          <Text style={styles.resultDescription}>{result.description}</Text>
          <View style={styles.resultCta}>
            <Button
              title="Build my profile"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push('/(auth)/profile-setup')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: Colors.sand,
  },
  questionCounter: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Progress
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sage,
    borderRadius: 2,
  },

  scrollContent: {
    flexGrow: 1,
    gap: 32,
  },

  // Question
  questionSection: { gap: 12 },
  questionLabel: {
    fontSize: 12,
    color: Colors.sage,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.offwhite,
    lineHeight: 30,
  },

  // Options
  optionsSection: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.sage,
    backgroundColor: `${Colors.sage}15`,
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    marginTop: 1,
  },
  optionDotSelected: {
    borderColor: Colors.sage,
    backgroundColor: Colors.sage,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  optionTextSelected: {
    color: Colors.offwhite,
  },

  // Footer
  footer: {
    paddingTop: 20,
  },

  // Result screen
  resultContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 20,
  },
  resultEmoji: {
    fontSize: 56,
  },
  resultTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  resultStyle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.offwhite,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: 14,
    color: Colors.sand,
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 8,
  },
  resultCta: {
    width: '100%',
    marginTop: 16,
  },
});
