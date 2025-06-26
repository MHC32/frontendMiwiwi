import { Helmet } from 'react-helmet-async';
// sections
import { StoreListView } from 'src/sections/store/view';
// components
// ----------------------------------------------------------------------

export default function StoreListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Gestion des Magasins</title>
        <meta
          name="description"
          content="Page de gestion des magasins - Liste, création et modification des magasins"
        />
      </Helmet>

      <StoreListView />
    </>
  );
}