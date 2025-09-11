// src/pages/dashboard/meter-reading/store.tsx
import { Helmet } from 'react-helmet-async';
// sections
import { MeterReadingStoreView } from '../../../sections/meter-reading/view';

// ----------------------------------------------------------------------

export default function MeterReadingStorePage() {
  return (
    <>
      <Helmet>
        <title> Relevés de Compteur: Magasin | Minimal UI</title>
      </Helmet>

      <MeterReadingStoreView />
    </>
  );
}