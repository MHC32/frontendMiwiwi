import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
// types
import { IStoreItem } from 'src/types/store';
// requests
import { storeRequests } from 'src/utils/request';
//
import StoreNewEditForm from '../store-new-edit-form';
import { useSnackbar } from 'src/components/snackbar';

import { useRouter } from 'src/routes/hook';
// ----------------------------------------------------------------------

export default function StoreEditView() {
 const router = useRouter();
  const settings = useSettingsContext();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = params;


  const [currentStore, setCurrentStore] = useState<IStoreItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        if (!id) {
          throw new Error('ID du magasin non fourni');
        }
        
        const store = await storeRequests.getStoreDetails(id);
        setCurrentStore(store);
      } catch (error) {
        console.error('Erreur lors du chargement du magasin:', error);
        enqueueSnackbar(
          error.message || 'Erreur lors du chargement du magasin', 
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id, enqueueSnackbar]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentStore) {
    return null; // Vous pourriez aussi rediriger vers la liste des magasins ici
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Modifier le magasin"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Magasins',
            href: paths.dashboard.store.root,
          },
          { name: currentStore.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StoreNewEditForm currentStore={currentStore} storeId={id} />
    </Container>
  );
}