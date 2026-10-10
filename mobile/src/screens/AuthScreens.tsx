import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card, Field, styles as ui} from '../components/ui';
import {LpsLogo} from '../components/LpsLogo';
import {packages} from '../data/packages';
import {useAuth} from '../context/AuthContext';
import {colors} from '../theme';
import {PackageId} from '../types';

type AuthStack = {
  Packages: undefined;
  Login: undefined;
  Register: {packageId?: PackageId} | undefined;
};

export function PackageScreen({navigation}: NativeStackScreenProps<AuthStack, 'Packages'>) {
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <LpsLogo />
      <Text style={ui.title}>London Property Services</Text>
      <Text style={ui.subtitle}>Professional property care, maintenance and repairs — managed in one app.</Text>
      <View style={{height: 18}} />
      {packages.map(p => (
        <Card key={p.id} style={p.highlighted ? {borderWidth: 2, borderColor: colors.primary} : undefined}>
          <View style={styles.rowBetween}>
            <Text style={styles.plan}>{p.name}</Text>
            {p.highlighted && <Text style={styles.popular}>POPULAR</Text>}
          </View>
          <Text style={styles.price}>£{p.price.toFixed(2)}<Text style={styles.month}> / month</Text></Text>
          <Text style={ui.subtitle}>{p.summary}</Text>
          {p.features.map(f => <Text key={f} style={styles.feature}>✓ {f}</Text>)}
          <Text style={styles.meta}>Response: {p.response}</Text>
          <Text style={styles.meta}>{p.schedule}</Text>
          <Text style={styles.meta}>{p.callLimit}</Text>
          <Button title={`Choose ${p.name}`} onPress={() => navigation.navigate('Register', {packageId: p.id})} style={{marginTop: 12}} />
        </Card>
      ))}
      <Button title="I already have an account" secondary onPress={() => navigation.navigate('Login')} />
      <Text style={styles.footnote}>* Gold call/material rules should be confirmed in the final customer contract.</Text>
    </ScrollView>
  );
}

export function LoginScreen() {
  const {login} = useAuth();
  const [email, setEmail] = useState('homeowner@lps.co.uk');
  const [password, setPassword] = useState('123456');
  const submit = async () => {
    const error = await login(email.trim(), password);
    if (error) Alert.alert('Login', error);
  };
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <LpsLogo small />
      <Text style={ui.title}>Sign in</Text>
      <Text style={ui.subtitle}>Access your property, maintenance requests and invoices.</Text>
      <View style={{height: 22}} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign in" onPress={submit} />
      <Text style={styles.demo}>Demo admin: admin@lps.co.uk / 123456</Text>
    </ScrollView>
  );
}

export function RegisterScreen({route}: NativeStackScreenProps<AuthStack, 'Register'>) {
  const {register} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [packageId, setPackageId] = useState<PackageId>(route.params?.packageId ?? 'basic');
  const submit = async () => {
    const error = await register({name, email, phone, packageId});
    if (error) Alert.alert('Registration', error);
  };
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <LpsLogo small />
      <Text style={ui.title}>Create your LPS account</Text>
      <Text style={ui.subtitle}>Your selected plan is used as the starting subscription in this demo.</Text>
      <View style={{height: 18}} />
      <Field label="Full name" value={name} onChangeText={setName} placeholder="John Smith" />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="john@example.com" />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+44..." />
      <Text style={styles.sectionLabel}>Plan</Text>
      <View style={styles.planPicker}>
        {packages.map(p => (
          <Button key={p.id} title={`${p.name} · £${p.price}`} secondary={packageId !== p.id} onPress={() => setPackageId(p.id)} style={{marginBottom: 8}} />
        ))}
      </View>
      <Button title="Create account" onPress={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  plan: {fontSize: 22, fontWeight: '900', color: colors.text},
  popular: {fontSize: 10, fontWeight: '900', color: colors.primaryDark, backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99},
  price: {fontSize: 27, fontWeight: '900', color: colors.primary, marginTop: 5},
  month: {fontSize: 13, fontWeight: '600', color: colors.muted},
  feature: {fontSize: 14, color: colors.text, marginTop: 8},
  meta: {fontSize: 12, color: colors.muted, marginTop: 7},
  footnote: {fontSize: 11, color: colors.muted, marginTop: 14},
  demo: {textAlign: 'center', color: colors.muted, marginTop: 18, fontSize: 12},
  sectionLabel: {fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 8},
  planPicker: {marginBottom: 10},
});