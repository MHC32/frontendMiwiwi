import { Helmet } from 'react-helmet-async';
// sections
import {CompanyListView} from 'src/sections/company/view'

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Compagnie liste</title>
      </Helmet>

      <CompanyListView />
    </>
  );
}
