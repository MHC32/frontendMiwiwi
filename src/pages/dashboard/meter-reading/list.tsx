// src/pages/dashboard/meter-reading/list.tsx
import { Helmet } from 'react-helmet-async';
// sections
import { MeterReadingListView } from '../../../sections/meter-reading/view';

// ----------------------------------------------------------------------

export default function MeterReadingListPage() {
  return (
    <>
      <Helmet>
        <title> Relevés de Compteur: Liste | Minimal UI</title>
      </Helmet>

      {/* Le composant gère maintenant tout en interne avec le dropdown */}
      <MeterReadingListView />
    </>
  );
}