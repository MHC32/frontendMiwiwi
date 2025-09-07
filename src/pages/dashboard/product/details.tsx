// src/pages/dashboard/product/details.tsx
import { Helmet } from 'react-helmet-async';
// sections
import { ProductDetailsView } from '../../../sections/product/view';

// ----------------------------------------------------------------------

export default function ProductDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Product: Details | Minimal UI</title>
      </Helmet>

      <ProductDetailsView />
    </>
  );
}