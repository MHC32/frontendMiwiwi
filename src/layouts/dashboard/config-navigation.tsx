import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  document: icon('ic_file'), // Utilisons l'icône 'file' pour 'document'
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // USER
          {
            title: 'Utilisateur',
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: 'Compte', path: paths.dashboard.user.account },
            ],
          },
          
          {
            title: 'Magasin',
            path: paths.dashboard.store.root,
            icon: ICONS.banking,
            children: [
              { title: 'Ajouter Magasin', path: paths.dashboard.store.new },
              { title: 'Liste Magasin', path: paths.dashboard.store.list },
            ],
          },

          {
            title: 'Employer',
            path: paths.dashboard.employee.root,
            icon: ICONS.job,
            children: [
              { title: 'Ajouter Employer', path: paths.dashboard.employee.new },
              { title: 'Liste Employer', path: paths.dashboard.employee.list },
            ],
          },

          {
            title: 'Catégorie',
            path: paths.dashboard.category.root,
            icon: ICONS.label,
            children: [
              { title: 'Liste Catégorie', path: paths.dashboard.category.list },
            ],
          },

          {
            title: 'Produit',
            path: paths.dashboard.product.root,
            icon: ICONS.product,
            children: [
              { title: 'Ajouter Produit', path: paths.dashboard.product.new },
              { title: 'Liste Produit', path: paths.dashboard.product.list },
            ],
          },

          // 🆕 MODULE DOCUMENT (METER READING)
          {
            title: 'Document',
            path: paths.dashboard.meterReading.root,
            icon: ICONS.document,
            children: [
              { title: 'Relevés Compteur', path: paths.dashboard.meterReading.list },
            ],
          },
        ],
      },
    ],
    [t]
  );

  return data;
}