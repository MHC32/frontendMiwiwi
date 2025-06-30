import { Helmet } from 'react-helmet-async';
// sections
import { EmployeeListView } from 'src/sections/employee/view';
// components
// ----------------------------------------------------------------------

export default function StoreListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Gestion des employer</title>
        <meta
          name="description"
          content="Page de gestion des employer - Liste, création et modification des employer"
        />
      </Helmet>

      <EmployeeListView />
    </>
  );
}