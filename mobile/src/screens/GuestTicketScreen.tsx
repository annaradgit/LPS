import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Button, Card, Field, styles as ui} from '../components/ui';
import {colors} from '../theme';
import {loadState, saveState} from '../services/storage';

export type GuestTicketStack = {
  GuestTicket: undefined;
};

type Props = NativeStackScreenProps<GuestTicketStack, 'GuestTicket'>;

export default function GuestTicketScreen({navigation}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('London');
  const [postcode, setPostcode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');

  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!name || !phone || !postcode || !title || !description) {
      Alert.alert(
        'Missing information',
        'Please complete your name, phone, postcode and repair details.',
      );
      return;
    }

    setSending(true);

    try {
      const state = await loadState();

      const ticket = {
        id: 'G-${Date.now().toString().slice(-8)}',
        propertyId: 'GUEST',
        title,
        description,
        priority,
        status: 'open',
        createdAt: new Date().toISOString(),

        guest: true,
        guestName: name,
        guestPhone: phone,
        guestEmail: email,
        guestAddress: address,
        guestCity: city,
        guestPostcode: postcode,
      };

      state.tickets.unshift(ticket);

      await saveState(state);

      Alert.alert(
        'Request submitted',
        'Your repair request has been submitted.\n\nReference: ${ticket.id}\n\nThe LPS team will contact you as soon as possible.',
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch {
      Alert.alert(
        'Error',
        'We could not submit your request. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView
      style={ui.screen}
      contentContainerStyle={ui.content}
      keyboardShouldPersistTaps="handled">

      <Text style={ui.title}>Request a Repair</Text>

      <Text style={ui.subtitle}>
        You do not need an account to request help from London Property
        Services.
      </Text>

      <View style={{height: 20}} />

      <Card>
        <Text style={styles.section}>Your details</Text>

        <Field
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="John Smith"
        />

        <Field
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="07..."
        />

        <Field
          label="Email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="john@example.com"
        />
      </Card>

      <Card>
        <Text style={styles.section}>Property address</Text>

        <Field
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="10 Example Road"
        />

        <Field
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="London"
        />

        <Field
          label="Postcode"
          value={postcode}
          onChangeText={setPostcode}
          autoCapitalize="characters"
          placeholder="SE20 7AA"
        />
      </Card>

      <Card>
        <Text style={styles.section}>Repair details</Text>
        <Field
          label="What do you need help with?"
          value={title}
          onChangeText={setTitle}
          placeholder="Water leak in kitchen"
        />

        <Field
          label="Describe the problem"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholder="Please describe the problem..."
        />

        <Text style={styles.label}>Priority</Text>

        <View style={styles.priorityRow}>
          {(['Low', 'Medium', 'High', 'Emergency'] as const).map(item => (
            <Button
              key={item}
              title={item}
              secondary={priority !== item}
              onPress={() => setPriority(item)}
              style={styles.priorityButton}
            />
          ))}
        </View>
      </Card>

      <Button
        title="Submit Repair Request"
        onPress={submit}
        disabled={sending}
      />

      <Text style={styles.note}>
        No account is required. Your reference number will be shown after
        submission.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },

  priorityRow: {
    gap: 8,
  },

  priorityButton: {
    marginBottom: 4,
  },

  note: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 15,
    lineHeight: 18,
  },
});