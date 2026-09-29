import { Redirect, useLocalSearchParams } from 'expo-router';

/** Barcode flow replaced by photo meal scan (MFP-style). */
export default function ScanBarcodeRedirect() {
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/nutrition/scan-meal',
        params: { meal: params.meal, date: params.date },
      }}
    />
  );
}
