import { Helmet } from 'react-helmet-async';
// sections
import EmployeeCreateView from 'src/sections/employee/view/employee-create-view';

// ----------------------------------------------------------------------

export default function StoreEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Créer un nouveau employer</title>
        <meta
          name="description"
          content="Page de création de nouveau employer "
        />
      </Helmet>

      <EmployeeCreateView />
    </>
  );
}