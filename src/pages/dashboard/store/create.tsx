import { Helmet } from 'react-helmet-async';
// sections
import StoreCreateView from 'src/sections/store/view/store-create-view';

// ----------------------------------------------------------------------

export default function StoreEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Créer Magasin</title>
        <meta
          name="description"
          content="Page de création d'un magasin"
        />
      </Helmet>

      <StoreCreateView />
    </>
  );
}