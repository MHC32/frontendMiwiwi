import { Helmet } from 'react-helmet-async';
// sections
import { ProductEditView } from '../../../sections/product/view';

// ----------------------------------------------------------------------

export default function ProductEditPage() {
  return (
    <>
      <Helmet>
        <title> Product: Edit | Minimal UI</title>
      </Helmet>

      <ProductEditView />
    </>
  );
}