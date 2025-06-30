import { Helmet } from 'react-helmet-async';
// sections
import EmployeeEditView from 'src/sections/employee/view/employee-edit-view';

// ----------------------------------------------------------------------

export default function StoreEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Modifier employer</title>
        <meta
          name="description"
          content="Page de modification des informations d'un employer"
        />
      </Helmet>

      <EmployeeEditView />
    </>
  );
}