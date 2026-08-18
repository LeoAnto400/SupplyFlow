import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  createSupplierProduct,
  deleteSupplier,
  deleteSupplierProduct,
  listSupplierProducts,
  listSuppliers,
  updateSupplier,
  updateSupplierProduct,
  type CreateSupplierInput,
  type CreateSupplierProductInput,
  type UpdateSupplierInput,
  type UpdateSupplierProductInput,
} from "@/lib/api/suppliers";

export const suppliersQueryKey = ["suppliers"] as const;
export const supplierProductsQueryKey = (supplierId: string) => ["suppliers", supplierId, "products"] as const;

export function useSuppliers() {
  return useQuery({
    queryKey: suppliersQueryKey,
    queryFn: listSuppliers,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSupplierInput) => createSupplier(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierInput }) => updateSupplier(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
    },
  });
}

export function useSupplierProducts(supplierId: string) {
  return useQuery({
    queryKey: supplierProductsQueryKey(supplierId),
    queryFn: () => listSupplierProducts(supplierId),
  });
}

export function useCreateSupplierProduct(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSupplierProductInput) => createSupplierProduct(supplierId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierProductsQueryKey(supplierId) });
    },
  });
}

export function useUpdateSupplierProduct(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ termId, input }: { termId: string; input: UpdateSupplierProductInput }) =>
      updateSupplierProduct(supplierId, termId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierProductsQueryKey(supplierId) });
    },
  });
}

export function useDeleteSupplierProduct(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (termId: string) => deleteSupplierProduct(supplierId, termId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierProductsQueryKey(supplierId) });
    },
  });
}
