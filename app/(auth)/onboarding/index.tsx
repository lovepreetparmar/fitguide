import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import {
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  WORKOUT_DAYS,
  EQUIPMENT_OPTIONS,
  GENDER_OPTIONS,
} from '@/constants/app';
import type { Equipment, ExperienceLevel, FitnessGoal, Gender } from '@/types';

const STEPS = [
  'Welcome',
  'About You',
  'Body Stats',
  'Goals',
  'Experience',
  'Schedule',
  'Equipment',
  'Health',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingData, completeOnboarding, onboardingData } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(onboardingData.name ?? '');
  const [age, setAge] = useState(String(onboardingData.age ?? ''));
  const [gender, setGender] = useState<Gender | null>(onboardingData.gender ?? null);
  const [height, setHeight] = useState(String(onboardingData.height_cm ?? ''));
  const [weight, setWeight] = useState(String(onboardingData.weight_kg ?? ''));
  const [goal, setGoal] = useState<FitnessGoal | null>(onboardingData.goal ?? null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(
    onboardingData.experience ?? null
  );
  const [workoutDays, setWorkoutDays] = useState(onboardingData.workout_days ?? 4);
  const [workoutTime, setWorkoutTime] = useState(
    String(onboardingData.workout_time_minutes ?? 60)
  );
  const [equipment, setEquipment] = useState<Equipment[]>(onboardingData.equipment ?? []);
  const [medical, setMedical] = useState(onboardingData.medical_limitations ?? '');
  const [injuries, setInjuries] = useState(onboardingData.previous_injuries ?? '');

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleEquipment = (id: Equipment) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return name.length > 0 && age.length > 0 && gender !== null;
      case 2: return height.length > 0 && weight.length > 0;
      case 3: return goal !== null;
      case 4: return experience !== null;
      case 5: return workoutDays > 0 && workoutTime.length > 0;
      case 6: return equipment.length > 0;
      case 7: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const data = {
        name,
        age: parseInt(age, 10),
        height_cm: parseInt(height, 10),
        weight_kg: parseFloat(weight),
        gender: gender!,
        goal: goal!,
        experience: experience!,
        workout_days: workoutDays,
        workout_time_minutes: parseInt(workoutTime, 10),
        equipment,
        medical_limitations: medical,
        previous_injuries: injuries,
      };
      setOnboardingData(data);
      await completeOnboarding();
      setLoading(false);
      router.replace('/');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View className="flex-1 items-center justify-center px-4">
            <View className="mb-8 h-28 w-28 items-center justify-center rounded-3xl bg-primary">
              <Text className="text-5xl font-bold text-white">FG</Text>
            </View>
            <Text className="mb-3 text-center text-3xl font-bold text-text">
              Welcome to Fit Guide
            </Text>
            <Text className="text-center text-base leading-6 text-text-secondary">
              Let's personalize your fitness journey. This will only take a minute.
            </Text>
          </View>
        );

      case 1:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">About You</Text>
            <Text className="mb-6 text-text-secondary">Tell us a bit about yourself</Text>
            <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} />
            <Input label="Age" placeholder="25" keyboardType="numeric" value={age} onChangeText={setAge} />
            <Text className="mb-3 text-sm font-medium text-text-secondary">Gender</Text>
            <View className="flex-row flex-wrap gap-2">
              {GENDER_OPTIONS.map((g) => (
                <Chip
                  key={g.id}
                  label={g.label}
                  selected={gender === g.id}
                  onPress={() => setGender(g.id as Gender)}
                />
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">Body Stats</Text>
            <Text className="mb-6 text-text-secondary">Help us calculate your training needs</Text>
            <Input label="Height (cm)" placeholder="175" keyboardType="numeric" value={height} onChangeText={setHeight} />
            <Input label="Weight (kg)" placeholder="75" keyboardType="numeric" value={weight} onChangeText={setWeight} />
          </View>
        );

      case 3:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">Your Goal</Text>
            <Text className="mb-6 text-text-secondary">What do you want to achieve?</Text>
            <View className="gap-3">
              {FITNESS_GOALS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGoal(g.id as FitnessGoal)}
                  className={`flex-row items-center rounded-card border p-4 ${
                    goal === g.id ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <Ionicons
                    name={g.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={goal === g.id ? '#6C63FF' : '#A0A0A0'}
                  />
                  <Text className={`ml-4 text-base font-medium ${goal === g.id ? 'text-primary' : 'text-text'}`}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">Experience</Text>
            <Text className="mb-6 text-text-secondary">How long have you been training?</Text>
            <View className="gap-3">
              {EXPERIENCE_LEVELS.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  onPress={() => setExperience(e.id as ExperienceLevel)}
                  className={`rounded-card border p-4 ${
                    experience === e.id ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <Text className={`text-base font-semibold ${experience === e.id ? 'text-primary' : 'text-text'}`}>
                    {e.label}
                  </Text>
                  <Text className="mt-1 text-sm text-text-secondary">{e.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">Schedule</Text>
            <Text className="mb-6 text-text-secondary">How often do you want to train?</Text>
            <Text className="mb-3 text-sm font-medium text-text-secondary">Workout Days</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {WORKOUT_DAYS.map((d) => (
                <Chip
                  key={d.id}
                  label={d.label}
                  selected={workoutDays === d.id}
                  onPress={() => setWorkoutDays(d.id)}
                />
              ))}
            </View>
            <Input
              label="Workout Duration (minutes)"
              placeholder="60"
              keyboardType="numeric"
              value={workoutTime}
              onChangeText={setWorkoutTime}
            />
          </View>
        );

      case 6:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">Equipment</Text>
            <Text className="mb-6 text-text-secondary">What equipment do you have access to?</Text>
            <View className="flex-row flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((e) => (
                <Chip
                  key={e.id}
                  label={e.label}
                  selected={equipment.includes(e.id as Equipment)}
                  onPress={() => toggleEquipment(e.id as Equipment)}
                />
              ))}
            </View>
          </View>
        );

      case 7:
        return (
          <View>
            <Text className="mb-2 text-2xl font-bold text-text">Health Info</Text>
            <Text className="mb-6 text-text-secondary">Any limitations we should know about? (Optional)</Text>
            <Input
              label="Medical Limitations"
              placeholder="e.g., lower back issues"
              value={medical}
              onChangeText={setMedical}
              multiline
            />
            <Input
              label="Previous Injuries"
              placeholder="e.g., torn ACL in 2020"
              value={injuries}
              onChangeText={setInjuries}
              multiline
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4">
        <ProgressBar progress={progress} height={4} color="#6C63FF" />
        <Text className="mt-2 text-xs text-text-muted">
          Step {step + 1} of {STEPS.length}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          {renderStep()}
        </Animated.View>
      </ScrollView>

      <View className="flex-row gap-3 px-6 pb-6">
        {step > 0 && (
          <Button
            title="Back"
            variant="outline"
            onPress={() => setStep(step - 1)}
            className="flex-1"
          />
        )}
        <Button
          title={step === STEPS.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          loading={loading}
          className="flex-1"
        />
      </View>
    </SafeAreaView>
  );
}
