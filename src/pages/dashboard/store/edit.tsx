import { Helmet } from 'react-helmet-async';
// sections
import StoreEditView from 'src/sections/store/view/store-edit-view';

// ----------------------------------------------------------------------

export default function StoreEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Modifier Magasin</title>
        <meta
          name="description"
          content="Page de modification des informations d'un magasin"
        />
      </Helmet>

      <StoreEditView />
    </>
  );
}