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
import { Cashier, Supervisor } from 'src/types/employee';
// requests
import { employeeRequests } from 'src/utils/request';
//
import EmployeeNewEditForm from '../employee-new-edit-form';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function EmployeeEditView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = params;

  const [currentEmployee, setCurrentEmployee] = useState<Cashier | Supervisor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (!id) {
          throw new Error('ID de l\'employé non fourni');
        }
        
        const employee = await employeeRequests.getEmployeeDetails(id);
        setCurrentEmployee(employee);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'employé:', error);
        enqueueSnackbar(
          error.message || 'Erreur lors du chargement de l\'employé', 
          { variant: 'error' }
        );
        router.push(paths.dashboard.employee.root);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, enqueueSnackbar, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentEmployee) {
    return null;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Modifier l'employé"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Employés',
            href: paths.dashboard.employee.root,
          },
          { 
            name: `${currentEmployee.first_name} ${currentEmployee.last_name}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <EmployeeNewEditForm currentEmployee={currentEmployee} employeeId={id} />
    </Container>
  );
}