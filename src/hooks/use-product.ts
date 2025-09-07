import { useSelector } from 'react-redux';
import {
  selectProducts,
  selectCurrentProduct,
  selectProductLoading,
  selectProductError,
  selectProductPagination,
  selectActiveProducts,
  selectLowStockProducts,
} from '../redux/slices/product';

export function useProduct() {
  const products = useSelector(selectProducts);
  const currentProduct = useSelector(selectCurrentProduct);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const pagination = useSelector(selectProductPagination);
  const activeProducts = useSelector(selectActiveProducts);
  const lowStockProducts = useSelector(selectLowStockProducts);

  return {
    products,
    currentProduct,
    loading,
    error,
    pagination,
    activeProducts,
    lowStockProducts,
  };
}