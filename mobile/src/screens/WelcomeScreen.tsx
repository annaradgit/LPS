import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {colors} from '../theme';
import {Button} from '../components/ui';

export type WelcomeStackParamList = {
  Welcome: undefined;
  GuestTicket: undefined;
  Login: undefined;
  Packages: undefined;
};

type Props = NativeStackScreenProps<WelcomeStackParamList, 'Welcome'>;

export default function WelcomeScreen({navigation}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>⌂</Text>
          </View>

          <Text style={styles.logoTitle}>LONDON</Text>
          <Text style={styles.logoSubtitle}>PROPERTY SERVICES</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>
            Your Property.{'\n'}
            <Text style={styles.orange}>Our Responsibility.</Text>
          </Text>

          <Text style={styles.description}>
            Professional property maintenance, monitoring and repair
            services for homeowners and landlords.
          </Text>
        </View>

        <View style={styles.features}>
          <Feature
            icon="✓"
            title="Monthly Property Checks"
          />

          <Feature
            icon="✓"
            title="Maintenance Reminders"
          />

          <Feature
            icon="✓"
            title="Monthly Property Reports"
          />

          <Feature
            icon="✓"
            title="Professional Repair Support"
          />
        </View>

        <View style={styles.actions}>

          <Button
            title="🛠 Request a Repair — No Account Required"
            onPress={() => navigation.navigate('GuestTicket')}
            style={{marginBottom: 16}}
          />

          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Packages')}
          />

          <Button
            title="I Already Have an Account"
            secondary
            onPress={() => navigation.navigate('Login')}
          />
        </View>

        <Text style={styles.footer}>
          Reliable care for your property
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Text style={styles.check}>{icon}</Text>
      </View>

      <Text style={styles.featureText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 20,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  logoIcon: {
    fontSize: 48,
    color: '#FFF',
    fontWeight: '700',
    lineHeight: 55,
  },

  logoTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#222',
  },

  logoSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.primary,
    marginTop: 3,
  },

  hero: {
    marginTop: 42,
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1E1E1E',
  },

  orange: {
    color: colors.primary,
  },

  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 23,
    color: '#6B6B6B',
    textAlign: 'center',
    maxWidth: 340,
  },

  features: {
    marginTop: 30,
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  check: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
featureText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  actions: {
    marginTop: 'auto',
    gap: 12,
  },

  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 18,
  },
});