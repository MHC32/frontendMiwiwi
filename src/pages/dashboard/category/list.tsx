// src/pages/dashboard/category/list.tsx
import { Helmet } from 'react-helmet-async';
// sections
import { CategoryListView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export default function CategoryListPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Catégories</title>
      </Helmet>

      <CategoryListView />
    </>
  );
}