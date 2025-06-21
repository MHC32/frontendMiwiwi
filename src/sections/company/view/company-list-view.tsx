import { useState, useEffect } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import { useTable } from 'src/components/table';
import axios from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
import {
  Box,
  Card,
  Table,
  Button,
  Container,
  TableBody,
  TableContainer,
  LinearProgress,
  Typography
} from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import CompanyTableRow from '../company-table-row';
import { ICompanyItem } from 'src/types/company';

export default function CompanyOwnerView() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const settings = useSettingsContext();
  const table = useTable();

  const [company, setCompany] = useState<ICompanyItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch owner's company
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/owner/my-companies');
        setCompany(response.data);
      } catch (error) {
        enqueueSnackbar('Erreur de chargement', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Mon entreprise"
        links={[
          { name: 'Tableau de bord', href: paths.dashboard.root },
        //   { name: 'Entreprise', href: paths.dashboard.company.root },
        ]}
      />

      <Card sx={{ mt: 3 }}>
        {company ? (
          <TableContainer>
            <Table>
              <TableBody>
                <CompanyTableRow
                  row={company}
                  selected={false}
                  onSelectRow={() => {}}
                  onEditRow={() => {}}
                  onDeleteRow={() => {}}
                  hideActions // Nouvelle prop pour cacher les actions
                />
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Aucune entreprise enregistrée
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            //   onClick={() => router.push(paths.dashboard.company.new)}
            >
              Créer mon entreprise
            </Button>
          </Box>
        )}
      </Card>
    </Container>
  );
}