// src/pages/dashboard/product/new.tsx - Page de création
import { Helmet } from 'react-helmet-async';
// sections
import { ProductCreateView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductCreatePage() {
  return (
    <>
      <Helmet>
        <title> Product: Create | Minimal UI</title>
      </Helmet>

      <ProductCreateView />
    </>
  );
}
