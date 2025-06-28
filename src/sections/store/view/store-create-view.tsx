import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import StoreNewEditForm from '../store-new-edit-form';

// ----------------------------------------------------------------------

export default function StoreCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Créer un nouveau magasin"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Magasins',
            href: paths.dashboard.store.root,
          },
          { name: 'Nouveau magasin' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StoreNewEditForm />
    </Container>
  );
}