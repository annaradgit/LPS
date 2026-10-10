import React, {useEffect, useMemo, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Badge, Card, Field, styles as ui} from '../components/ui';
import {useAuth} from '../context/AuthContext';
import {loadState, saveState} from '../services/storage';
import {payInvoice} from '../services/paymentService';
import {packages} from '../data/packages';
import {colors} from '../theme';
import {Ticket, TicketStatus} from '../types';

type HomeStack = {
  Home: undefined;
  Property: undefined;
  Tickets: undefined;
  CreateTicket: undefined;
  TicketDetail: {ticketId: string};
  Payment: {ticketId: string};
  Profile: undefined;
};

function statusTone(status: TicketStatus): 'neutral'|'success'|'warning'|'danger' {
  if (['completed','confirmed','closed','paid'].includes(status)) return 'success';
  if (['quoted','awaiting_payment'].includes(status)) return 'warning';
  if (status === 'open') return 'danger';
  return 'neutral';
}

export function HomeScreen({navigation}: NativeStackScreenProps<HomeStack, 'Home'>) {
  const {user} = useAuth();
  const plan = packages.find(p => p.id === user?.packageId);
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>Hello, {user?.name?.split(' ')[0] || 'Homeowner'} 👋</Text>
      <Text style={ui.subtitle}>Your property care dashboard.</Text>
      <View style={{height: 18}} />
      <Card>
        <Text style={styles.kicker}>YOUR PLAN</Text>
        <Text style={styles.big}>{plan?.name ?? 'Basic'} · £{plan?.price.toFixed(2)}/month</Text>
        <Text style={ui.subtitle}>{plan?.response} response · {plan?.callLimit}</Text>
      </Card>
      <Button title="Open a maintenance ticket" onPress={() => navigation.navigate('CreateTicket')} />
      <View style={{height: 10}} />
      <Button title="My tickets" secondary onPress={() => navigation.navigate('Tickets')} />
      <View style={{height: 10}} />
      <Button title="My property" secondary onPress={() => navigation.navigate('Property')} />
      <View style={{height: 10}} />
      <Button title="My account" secondary onPress={() => navigation.navigate('Profile')} />
      <Card style={{marginTop: 18}}>
        <Text style={styles.section}>Monthly maintenance</Text>
        <Text style={styles.item}>✓ Heating & radiator checks</Text>
        <Text style={styles.item}>✓ Water leak & damp checks</Text>
        <Text style={styles.item}>✓ Electrical safety reminders</Text>
        <Text style={styles.item}>✓ Smoke / CO alarm reminders</Text>
        <Text style={styles.item}>✓ Plumbing checks</Text>
      </Card>
    </ScrollView>
  );
}

export function PropertyScreen() {
  const {user, refresh} = useAuth();
  const property = user?.properties?.[0];
  const [name, setName] = useState(property?.name ?? '');
  const [address, setAddress] = useState(property?.addressLine1 ?? '');
  const [city, setCity] = useState(property?.city ?? '');
  const [postcode, setPostcode] = useState(property?.postcode ?? '');
  const [bedrooms, setBedrooms] = useState(property?.bedrooms ?? '');
  const [type, setType] = useState(property?.propertyType ?? '');
  const [notes, setNotes] = useState(property?.notes ?? '');

  useEffect(() => {
    if (property) {
      setName(property.name); setAddress(property.addressLine1); setCity(property.city);
      setPostcode(property.postcode); setBedrooms(property.bedrooms); setType(property.propertyType); setNotes(property.notes);
    }
  }, [property?.id]);

  const save = async () => {
    const state = await loadState();
    const next = {...state.user, properties: [{
      id: property?.id ?? 'P-1', name, addressLine1: address, city, postcode, bedrooms,
      propertyType: type, notes,
    }]};
    state.user = next;
    await saveState(state);
    await refresh();
    Alert.alert('Saved', 'Your property details have been updated.');
  };

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>My property</Text>
      <Text style={ui.subtitle}>Keep your home details accurate so the LPS team can attend the correct property.</Text>
      <View style={{height: 18}} />
      <Field label="Property name" value={name} onChangeText={setName} placeholder="Main home" />
      <Field label="Address" value={address} onChangeText={setAddress} placeholder="12 Example Road" />
      <Field label="City" value={city} onChangeText={setCity} placeholder="London" />
      <Field label="Postcode" value={postcode} onChangeText={setPostcode} placeholder="SE20 7AA" />
      <Field label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
      <Field label="Property type" value={type} onChangeText={setType} placeholder="House / Flat" />
      <Field label="Access notes" value={notes} onChangeText={setNotes} multiline placeholder="Parking, gate, keys, pets..." />
      <Button title="Save property" onPress={save} />
    </ScrollView>
  );
}

export function TicketListScreen({navigation}: NativeStackScreenProps<HomeStack, 'Tickets'>) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  useEffect(() => { loadState().then(s => setTickets(s.tickets)); }, []);
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <View style={styles.rowBetween}><View><Text style={ui.title}>My tickets</Text><Text style={ui.subtitle}>Track every maintenance request.</Text></View></View>
      <Button title="+ New ticket" onPress={() => navigation.navigate('CreateTicket')} style={{marginVertical: 16}} />
      {tickets.length === 0 && <Card><Text>No tickets yet.</Text></Card>}
      {tickets.map(t => (
        <Card key={t.id}>
          <View style={styles.rowBetween}><Text style={styles.ticketTitle}>{t.title}</Text><Badge text={t.status.replace('_', ' ')} tone={statusTone(t.status)} /></View>
          <Text style={ui.subtitle}>{t.description}</Text>
          <Text style={styles.small}>#{t.id} · {t.priority} priority</Text>
          {t.quote != null && <Text style={styles.quote}>Quote: £{t.quote.toFixed(2)}</Text>}
          <Button title="View ticket" secondary onPress={() => navigation.navigate('TicketDetail', {ticketId: t.id})} style={{marginTop: 10}} />
        </Card>
      ))}
    </ScrollView>
  );
}

export function CreateTicketScreen({navigation}: NativeStackScreenProps<HomeStack, 'CreateTicket'>) {
  const {user} = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low'|'Medium'|'High'|'Emergency'>('Medium');
  const submit = async () => {
    if (!title || !description) { Alert.alert('Missing information', 'Please enter a title and description.'); return; }
    const state = await loadState();
    state.tickets.unshift({
      id: `T-${Date.now().toString().slice(-6)}`,
      propertyId: user?.properties?.[0]?.id ?? 'P-1',
      title, description, priority,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    await saveState(state);
    Alert.alert('Ticket submitted', 'The LPS team can now review your request.');
    navigation.goBack();
  };
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>New maintenance request</Text>
      <Text style={ui.subtitle}>Tell LPS what needs repairing. The team will review it and provide a quote when required.</Text>
      <View style={{height: 18}} />
      <Field label="Problem title" value={title} onChangeText={setTitle} placeholder="e.g. Bathroom leak" />
      <Field label="What is happening?" value={description} onChangeText={setDescription} multiline numberOfLines={5} placeholder="Describe the issue, where it is, and anything you noticed..." />
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {(['Low','Medium','High','Emergency'] as const).map(p => (
          <Button key={p} title={p} secondary={priority !== p} onPress={() => setPriority(p)} style={{flex: 1, marginRight: 6}} />
        ))}
      </View>
      <Text style={styles.photoNote}>Photo/video attachments can be connected to cloud storage in the production API.</Text>
      <Button title="Submit ticket" onPress={submit} />
    </ScrollView>
  );
}

export function TicketDetailScreen({route, navigation}: NativeStackScreenProps<HomeStack, 'TicketDetail'>) {
  const {user} = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [rating, setRating] = useState(0);
  useEffect(() => { loadState().then(s => setTicket(s.tickets.find(t => t.id === route.params.ticketId) ?? null)); }, [route.params.ticketId]);
  if (!ticket) return <View style={[ui.screen, ui.content]}><Text>Ticket not found.</Text></View>;

  const confirmCompletion = async () => {
    if (!rating) { Alert.alert('Rating required', 'Please select a star rating first.'); return; }
    const state = await loadState();
    state.tickets = state.tickets.map(t => t.id === ticket.id ? {...t, status: 'closed', customerConfirmed: true, rating} : t);
    await saveState(state);
    setTicket({...ticket, status: 'closed', customerConfirmed: true, rating});
    Alert.alert('Thank you', 'The ticket has been confirmed and closed.');
  };

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>{ticket.title}</Text>
      <Badge text={ticket.status.replace('_', ' ')} tone={statusTone(ticket.status)} />
      <Card style={{marginTop: 16}}>
        <Text style={styles.section}>Issue</Text>
        <Text style={ui.subtitle}>{ticket.description}</Text>
        <Text style={styles.small}>Priority: {ticket.priority}</Text>
      </Card>
      {ticket.quote != null && (
        <Card>
          <Text style={styles.section}>LPS invoice</Text>
          <Text style={styles.invoice}>£{ticket.quote.toFixed(2)}</Text>
          <Text style={ui.subtitle}>{ticket.invoiceNote ?? 'Maintenance service invoice.'}</Text>
          {ticket.status === 'quoted' || ticket.status === 'awaiting_payment' ? (
            <Button title="Review & pay online" onPress={() => navigation.navigate('Payment', {ticketId: ticket.id})} style={{marginTop: 12}} />
          ) : <Text style={styles.paid}>✓ Payment recorded</Text>}
        </Card>
      )}
      {ticket.status === 'completed' && (
        <Card>
          <Text style={styles.section}>Confirm completed work</Text>
          <Text style={ui.subtitle}>If the repair is complete, confirm it and leave a star rating.</Text>
          <View style={styles.stars}>
            {[1,2,3,4,5].map(s => <Text key={s} onPress={() => setRating(s)} style={[styles.star, rating >= s && styles.starActive]}>★</Text>)}
          </View>
          <Button title="Confirm & close ticket" onPress={confirmCompletion} />
        </Card>
      )}
      {ticket.status === 'closed' && <Card><Text style={styles.paid}>✓ Closed · {ticket.rating}/5 customer rating</Text></Card>}
    </ScrollView>
  );
}

export function PaymentScreen({route, navigation}: NativeStackScreenProps<HomeStack, 'Payment'>) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { loadState().then(s => setTicket(s.tickets.find(t => t.id === route.params.ticketId) ?? null)); }, [route.params.ticketId]);
  const pay = async () => {
    if (!ticket?.quote) return;
    setBusy(true);
    const result = await payInvoice(ticket.id, ticket.quote);
    setBusy(false);
    if (!result.success) { Alert.alert('Payment failed', result.message); return; }
    const state = await loadState();
    state.tickets = state.tickets.map(t => t.id === ticket.id ? {...t, status: 'paid', paid: true} : t);
    await saveState(state);
    Alert.alert('Payment successful', result.message, [{text: 'OK', onPress: () => navigation.goBack()}]);
  };
  if (!ticket) return <View style={[ui.screen, ui.content]}><Text>Invoice not found.</Text></View>;
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>Invoice & payment</Text>
      <Card>
        <Text style={styles.section}>{ticket.title}</Text>
        <Text style={styles.invoice}>£{ticket.quote?.toFixed(2)}</Text>
        <Text style={ui.subtitle}>{ticket.invoiceNote}</Text>
      </Card>
      <Card>
        <Text style={styles.section}>Secure online payment</Text>
        <Text style={ui.subtitle}>This demo completes the payment flow locally. Connect Stripe PaymentSheet for live card payments.</Text>
        <Button title="Pay invoice" onPress={pay} disabled={busy} style={{marginTop: 14}} />
      </Card>
    </ScrollView>
  );
}

export function ProfileScreen() {
  const {user, logout} = useAuth();
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>My account</Text>
      <Card>
        <Text style={styles.section}>{user?.name}</Text>
        <Text style={ui.subtitle}>{user?.email}</Text>
        <Text style={ui.subtitle}>{user?.phone}</Text>
      </Card>
      <Button title="Sign out" secondary onPress={logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  kicker: {fontSize: 11, fontWeight: '900', color: colors.primary, letterSpacing: 1},
  big: {fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 6},
  section: {fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 8},
  item: {fontSize: 14, color: colors.text, marginTop: 8},
  ticketTitle: {fontSize: 17, fontWeight: '800', color: colors.text, flex: 1, marginRight: 10},
  small: {fontSize: 12, color: colors.muted, marginTop: 10},
  quote: {fontSize: 16, color: colors.primaryDark, fontWeight: '900', marginTop: 10},
  label: {fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 8},
  priorityRow: {flexDirection: 'row', marginBottom: 12},
  photoNote: {fontSize: 12, color: colors.muted, marginBottom: 15},
  invoice: {fontSize: 34, fontWeight: '900', color: colors.primary, marginBottom: 6},
  paid: {color: colors.success, fontWeight: '800', marginTop: 12},
  stars: {flexDirection: 'row', marginVertical: 14},
  star: {fontSize: 38, color: '#D7D0CA', marginRight: 4},
  starActive: {color: colors.primary},
});