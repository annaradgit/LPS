// import React, {useEffect, useState} from 'react';
// import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
// import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import {Button, Badge, Card, Field, styles as ui} from '../components/ui';
// import {loadState, saveState} from '../services/storage';
// import {Ticket} from '../types';
// import {colors} from '../theme';
// import {useAuth} from '../context/AuthContext';

// type AdminStack = {AdminHome: undefined; AdminTicket: {ticketId: string}};

// export function AdminHomeScreen({navigation}: NativeStackScreenProps<AdminStack, 'AdminHome'>) {
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const refresh = () => loadState().then(s => setTickets(s.tickets));
//   useEffect(() => { refresh(); }, []);
//   const open = tickets.filter(t => !['closed'].includes(t.status)).length;
//   const {logout} = useAuth();
//   return (
//     <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
//       <Text style={ui.title}>LPS Operations</Text>
//       <Text style={ui.subtitle}>Review customer requests, quote jobs and close completed work.</Text>
//       <View style={styles.stats}>
//         <Card style={styles.stat}><Text style={styles.statNum}>{open}</Text><Text style={styles.statLabel}>Open jobs</Text></Card>
//         <Card style={styles.stat}><Text style={styles.statNum}>{tickets.filter(t => t.status === 'awaiting_payment' || t.status === 'quoted').length}</Text><Text style={styles.statLabel}>Awaiting payment</Text></Card>
//       </View>
//       {tickets.map(t => (
//         <Card key={t.id}>
//           <View style={styles.rowBetween}>
//             <Text style={styles.title}>{t.title}</Text>
//             <Badge text={t.status.replace('_',' ')} tone={t.status === 'completed' ? 'success' : 'warning'} />
//           </View>
//           <Text style={ui.subtitle}>{t.description}</Text>
//           <Text style={styles.meta}>#{t.id} · {t.priority}</Text>
//           <Button title="Manage ticket" secondary onPress={() => navigation.navigate('AdminTicket', {ticketId: t.id})} style={{marginTop: 10}} />
//         </Card>
//       ))}
//       <Button title="Sign out" secondary onPress={() => {
//         Alert.alert('Sign out', 'Are you sure you want to Sign out?', [
//             {
//               text:'Cancel',
//               style:'cancel',
//             },
//             {
//               text:'Sign out',
//               style:'destructive',
//               onPress:logout,
//             }
//           ])
//         }} 
//         style={{marginBottom: 16}}
//       />
//     </ScrollView>
//   );
// }

// export function AdminTicketScreen({route, navigation}: NativeStackScreenProps<AdminStack, 'AdminTicket'>) {
//   const [ticket, setTicket] = useState<Ticket | null>(null);
//   const [quote, setQuote] = useState('');
//   const [note, setNote] = useState('');
//   const load = async () => {
//     const s = await loadState();
//     const found = s.tickets.find(t => t.id === route.params.ticketId) ?? null;
//     setTicket(found);
//     if (found?.quote != null) setQuote(String(found.quote));
//     setNote(found?.invoiceNote ?? '');
//   };
//   useEffect(() => { load(); }, [route.params.ticketId]);

//   const saveQuote = async () => {
//     const amount = Number(quote);
//     if (!amount || amount <= 0) { Alert.alert('Quote', 'Enter a valid amount.'); return; }
//     const s = await loadState();
//     s.tickets = s.tickets.map(t => t.id === ticket?.id ? {...t, quote: amount, invoiceNote: note, status: 'awaiting_payment'} : t);
//     await saveState(s);
//     Alert.alert('Invoice sent', 'The customer can now review and pay the invoice.');
//     load();
//   };

//   const complete = async () => {
//     const s = await loadState();
//     s.tickets = s.tickets.map(t => t.id === ticket?.id ? {...t, status: 'completed'} : t);
//     await saveState(s);
//     Alert.alert('Completed', 'The customer can now confirm the repair and rate the service.');
//     load();
//   };

//   if (!ticket) return <View style={[ui.screen, ui.content]}><Text>Ticket not found.</Text></View>;

//   return (
//     <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
//       <Text style={ui.title}>{ticket.title}</Text>
//       <Badge text={ticket.status.replace('_',' ')} tone={ticket.status === 'completed' ? 'success' : 'warning'} />
//       <Card style={{marginTop: 16}}>
//         <Text style={styles.section}>Customer request</Text>
//         <Text style={ui.subtitle}>{ticket.description}</Text>
//         <Text style={styles.meta}>Priority: {ticket.priority}</Text>
//       </Card>
//       <Card>
//         <Text style={styles.section}>Create / update invoice</Text>
//         <Field label="Price (£)" value={quote} onChangeText={setQuote} keyboardType="decimal-pad" placeholder="85.00" />
//         <Field label="Invoice note" value={note} onChangeText={setNote} multiline placeholder="Labour, parts and service details..." />
//         <Button title="Send invoice to customer" onPress={saveQuote} />
//       </Card>
//       <Card>
//         <Text style={styles.section}>Job status</Text>
//         <Text style={ui.subtitle}>When the physical repair is finished, mark the ticket completed. The homeowner must then confirm and rate it.</Text>
//         <Button title="Mark repair completed" onPress={complete} style={{marginTop: 12}} />
//       </Card>
//       <Button title="Back to tickets" secondary onPress={() => navigation.goBack()} />
//     </ScrollView>
//   );
// }

// export function ProfileScreen() {
//   const {user, logout} = useAuth();
//   return (
//     <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
//       <Text style={ui.title}>My account</Text>
//       <Card>
//         <Text style={styles.section}>{user?.name}</Text>
//         <Text style={ui.subtitle}>{user?.email}</Text>
//         <Text style={ui.subtitle}>{user?.phone}</Text>
//       </Card>
//       <Button title="Sign out" secondary onPress={logout} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
//   title: {fontSize: 17, fontWeight: '900', color: colors.text, flex: 1, marginRight: 8},
//   meta: {fontSize: 12, color: colors.muted, marginTop: 10},
//   section: {fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 10},
//   stats: {flexDirection: 'row', gap: 10, marginVertical: 12},
//   stat: {flex: 1, alignItems: 'center', marginBottom: 0},
//   statNum: {fontSize: 30, fontWeight: '900', color: colors.primary},
//   statLabel: {fontSize: 12, color: colors.muted, marginTop: 4},
// });















import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Badge, Card, Field, styles as ui} from '../components/ui';
import {completeTicket, getAdminTickets, sendQuote} from '../services/api';
import {Ticket} from '../types';
import {colors} from '../theme';
import {useAuth} from '../context/AuthContext';

type AdminStack = {AdminHome: undefined; AdminTicket: {ticketId: string}};

export function AdminHomeScreen({navigation}: NativeStackScreenProps<AdminStack, 'AdminHome'>) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const refresh = () => getAdminTickets().then(setTickets).catch(e => Alert.alert('Admin tickets', e instanceof Error ? e.message : 'Could not load tickets.'));
  useEffect(() => { refresh(); }, []);
  const open = tickets.filter(t => !['closed'].includes(t.status)).length;
  const {logout} = useAuth();
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>LPS Operations</Text>
      <Text style={ui.subtitle}>Review customer requests, quote jobs and close completed work.</Text>
      <View style={styles.stats}>
        <Card style={styles.stat}><Text style={styles.statNum}>{open}</Text><Text style={styles.statLabel}>Open jobs</Text></Card>
        <Card style={styles.stat}><Text style={styles.statNum}>{tickets.filter(t => t.status === 'awaiting_payment' || t.status === 'quoted').length}</Text><Text style={styles.statLabel}>Awaiting payment</Text></Card>
      </View>
      {tickets.map(t => (
        <Card key={t.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{t.title}</Text>
            <Badge text={t.status.replace('_',' ')} tone={t.status === 'completed' ? 'success' : 'warning'} />
          </View>
          <Text style={ui.subtitle}>{t.description}</Text>
          <Text style={styles.meta}>#{t.id} · {t.priority}</Text>
          <Button title="Manage ticket" secondary onPress={() => navigation.navigate('AdminTicket', {ticketId: t.id})} style={{marginTop: 10}} />
        </Card>
      ))}
      <Button title="Sign out" secondary onPress={() => {
        Alert.alert('Sign out', 'Are you sure you want to Sign out?', [
            {
              text:'Cancel',
              style:'cancel',
            },
            {
              text:'Sign out',
              style:'destructive',
              onPress:logout,
            }
          ])
        }} 
        style={{marginBottom: 16}}
      />
    </ScrollView>
  );
}

export function AdminTicketScreen({route, navigation}: NativeStackScreenProps<AdminStack, 'AdminTicket'>) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [quote, setQuote] = useState('');
  const [note, setNote] = useState('');
  const load = async () => {
    try {
      const all = await getAdminTickets();
      const found = all.find(t => t.id === route.params.ticketId) ?? null;
      setTicket(found);
      if (found?.quote != null) setQuote(String(found.quote));
      setNote(found?.invoiceNote ?? '');
    } catch (error) {
      Alert.alert('Admin ticket', error instanceof Error ? error.message : 'Could not load ticket.');
      setTicket(null);
    }
  };
  useEffect(() => { load(); }, [route.params.ticketId]);

  const saveQuote = async () => {
    const amount = Number(quote);
    if (!amount || amount <= 0) { Alert.alert('Quote', 'Enter a valid amount.'); return; }
    if (!ticket) return;
    try {
      await sendQuote(ticket.id, amount, note);
      Alert.alert('Invoice sent', 'The quote has been saved to the LPS database.');
      await load();
    } catch (error) {
      Alert.alert('Could not send quote', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const complete = async () => {
    if (!ticket) return;
    try {
      await completeTicket(ticket.id);
      Alert.alert('Completed', 'The completion status has been saved to the LPS database.');
      await load();
    } catch (error) {
      Alert.alert('Could not complete ticket', error instanceof Error ? error.message : 'The ticket must be paid or in progress first.');
    }
  };

  if (!ticket) return <View style={[ui.screen, ui.content]}><Text>Ticket not found.</Text></View>;

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>{ticket.title}</Text>
      <Badge text={ticket.status.replace('_',' ')} tone={ticket.status === 'completed' ? 'success' : 'warning'} />
      <Card style={{marginTop: 16}}>
        <Text style={styles.section}>Customer request</Text>
        <Text style={ui.subtitle}>{ticket.description}</Text>
        <Text style={styles.meta}>Priority: {ticket.priority}</Text>
      </Card>
      <Card>
        <Text style={styles.section}>Create / update invoice</Text>
        <Field label="Price (£)" value={quote} onChangeText={setQuote} keyboardType="decimal-pad" placeholder="85.00" />
        <Field label="Invoice note" value={note} onChangeText={setNote} multiline placeholder="Labour, parts and service details..." />
        <Button title="Send invoice to customer" onPress={saveQuote} />
      </Card>
      <Card>
        <Text style={styles.section}>Job status</Text>
        <Text style={ui.subtitle}>When the physical repair is finished, mark the ticket completed. The homeowner must then confirm and rate it.</Text>
        <Button title="Mark repair completed" onPress={complete} style={{marginTop: 12}} />
      </Card>
      <Button title="Back to tickets" secondary onPress={() => navigation.goBack()} />
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
  title: {fontSize: 17, fontWeight: '900', color: colors.text, flex: 1, marginRight: 8},
  meta: {fontSize: 12, color: colors.muted, marginTop: 10},
  section: {fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 10},
  stats: {flexDirection: 'row', gap: 10, marginVertical: 12},
  stat: {flex: 1, alignItems: 'center', marginBottom: 0},
  statNum: {fontSize: 30, fontWeight: '900', color: colors.primary},
  statLabel: {fontSize: 12, color: colors.muted, marginTop: 4},
});