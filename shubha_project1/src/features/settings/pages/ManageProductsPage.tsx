"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";
import { ScalablePagination } from "@/shared/components/ui/ScalablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";

import { Check, X, ArrowLeft } from "lucide-react";

import AddProductModal from "@/features/settings/components/AddProductModal";
import { handleApiError } from "@/shared/lib/api";
import { useBoards } from "@/features/boards/context/BoardsContext";
import FilterBar from "@/shared/components/layout/FilterBar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import ActionBar from "@/shared/components/layout/ActionBar";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { pushToast } from "@/shared/lib/toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  checkProductDeleteStatus,
  type ProductDeleteCheckResult,
} from "@/features/settings/api/products.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { fetchBrands } from "@/features/settings/api/brands.api";
import { fetchAssets } from "@/features/library/api/library.api";
import type { ProductViewModel, ProductFormValues, AssetViewModel, BrandViewModel } from "@/shared/types/domain";

type Product = ProductViewModel;

type Asset = AssetViewModel;

type NewProduct = ProductFormValues;

type Brand = BrandViewModel;

export default function ManageProductsPage() {
  const { params, setParams } = useUrlState();
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryString = location.search;

  // Query params (Manage Products):
  // search -> search, brand filter -> brandId, pagination -> page (selection via path).
  const parsePage = (value?: string) => {
    const parsed = parseInt(value ?? "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editProduct, setEditProduct] = useState<NewProduct>({
    brandId: "",
    name: "",
    url: "",
  });

  const { selectedBrand } = useBoards();

  // Filter bar state
  const [search, setSearch] = useState(() => params.search ?? "");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(
    () => params.brandId ?? null
  );
  const [draftBrandFilter, setDraftBrandFilter] = useState<string | null>(
    () => params.brandId ?? null
  );
  const parseProductId = (value?: string | null) => (value ? String(value) : null);
  const initialProductId = parseProductId(productId);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    initialProductId !== null ? [initialProductId] : []
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(() => parsePage(params.page));
  const itemsPerPage = 15;

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [deleteCheckResults, setDeleteCheckResults] = useState<ProductDeleteCheckResult[]>([]);

  const { data: brandsData } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });
  // Defensive: ensure brands is always an array even if API returns null
  const brands = Array.isArray(brandsData) ? brandsData : [];

  const qc = useQueryClient();

  const { data: productsData = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const { data: assetsResult } = useQuery<{ items: Asset[]; total: number }>({
    queryKey: ["assets", selectedBrand],
    queryFn: () =>
      fetchAssets(
        selectedBrand ? { brandId: selectedBrand } : undefined
      ),
  });
  
  const assetsData = assetsResult?.items ?? [];

  useEffect(() => {
    setProducts(Array.isArray(productsData) ? productsData : []);
    setEditingProductId(null);
  }, [productsData]);

  const toastError = (message: string) =>
    pushToast({ title: "Error", description: message, variant: "error" });

  const createProductMutation = useMutation({
    mutationFn: (form: ProductFormValues) => createProduct(form),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setProducts((prev) => [...prev, created]);
      setShowModal(false);
      setEditProduct({
        brandId: created.brandId,
        name: created.name,
        url: created.url ?? "",
      });
    },
    onError: (err) => toastError(handleApiError(err)),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: ProductFormValues }) =>
      updateProduct(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditingProductId(null);
    },
    onError: (err) => toastError(handleApiError(err)),
  });

  // Synchronize brand
  useEffect(() => {
    setSelectedBrandFilter(null);

    if (selectedBrand) {
      setEditProduct((prev) => ({ ...prev, brandId: selectedBrand }));
    } else if (brands.length > 0) {
      setEditProduct((prev) =>
        prev.brandId ? prev : { ...prev, brandId: brands[0].id }
      );
    }
  }, [selectedBrand, brands]);

  const brandMap = useMemo(
    () => Object.fromEntries(brands.map((b) => [b.id, b.name])),
    [brands]
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesBrand = selectedBrandFilter
        ? p.brandId === selectedBrandFilter
        : true;
      const haystack = `${p.name} ${p.url}`.toLowerCase();
      const matchesSearch = term ? haystack.includes(term) : true;
      return matchesBrand && matchesSearch;
    });
  }, [products, selectedBrandFilter, search]);

  useEffect(() => {
    setSearch(params.search ?? "");
  }, [params.search]);

  useEffect(() => {
    setSelectedBrandFilter(params.brandId ?? null);
    setDraftBrandFilter(params.brandId ?? null);
  }, [params.brandId]);

  useEffect(() => {
    setCurrentPage(parsePage(params.page));
  }, [params.page]);

  useEffect(() => {
    setParams({
      search: search || undefined,
      brandId: selectedBrandFilter || undefined,
      page: currentPage > 1 ? String(currentPage) : undefined,
    });
  }, [currentPage, search, selectedBrandFilter, setParams]);

  useEffect(() => {
    if (productId === undefined) return;
    const parsed = parseProductId(productId);
    if (parsed === null) {
      navigate(`/settings/products${queryString}`, { replace: true });
      return;
    }
    setSelectedProductIds((prev) =>
      prev.includes(parsed) ? prev : [parsed]
    );
  }, [navigate, productId, queryString]);

  useEffect(() => {
    if (selectedProductIds.length === 1) {
      const target = selectedProductIds[0];
      if (productId !== String(target)) {
        navigate(`/settings/products/${target}${queryString}`, {
          replace: true,
        });
      }
      return;
    }

    if (productId) {
      navigate(`/settings/products${queryString}`, { replace: true });
    }
  }, [navigate, productId, queryString, selectedProductIds]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  const productAssetCounts = useMemo(() => {
    const map = new Map<
      string,
      {
        image: number;
        video: number;
      }
    >();
    assetsData.forEach((asset) => {
      if (!asset.productId) return;
      const key = String(asset.productId);
      const prev = map.get(key) ?? { image: 0, video: 0 };
      if (asset.type === "video") {
        prev.video += 1;
      } else if (asset.type === "image") {
        prev.image += 1;
      }
      map.set(key, prev);
    });
    return map;
  }, [assetsData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrandFilter, search, filteredProducts.length]);

  const handleAddProduct = (newProduct: NewProduct) => {
    const name = newProduct.name.trim();
    if (!name) return;
    const normalized = name.toLowerCase();
    const exists = products.some(
      (p) => p.name.trim().toLowerCase() === normalized
    );
    if (exists) {
      pushToast({
        title: "Duplicate product",
        description: "A product with this name already exists.",
        variant: "error",
      });
      return;
    }
    createProductMutation.mutate({
      name,
      brandId: newProduct.brandId,
      url: newProduct.url,
      description: newProduct.description,
    });
  };

  const handleSaveEdit = (id: string) => {
    updateProductMutation.mutate({
      id,
      form: {
        brandId: editProduct.brandId,
        name: editProduct.name,
        url: editProduct.url,
        description: editProduct.description,
      },
    });
  };

  const handleCancelEdit = () => setEditingProductId(null);

  const handleBack = () => window.history.back();

  const filtersActive = !!search.trim() || !!selectedBrandFilter;

  const handleClearFilters = () => {
    setSearch("");
    setSelectedBrandFilter(null);
    setDraftBrandFilter(null);
    setSelectedProductIds([]);
    setEditingProductId(null);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const canEdit = selectedProductIds.length === 1;

  const handleSelectAllToggle = () => {
    // Toggle: If all filtered products are selected, deselect all; otherwise select all
    const allFilteredIds = filteredProducts.map((product) => product.id);
    const allFilteredSelected = allFilteredIds.every((id) => selectedProductIds.includes(id));

    if (allFilteredSelected) {
      // Deselect all filtered products
      setSelectedProductIds([]);
    } else {
      // Select all filtered products (across all pages)
      setSelectedProductIds(allFilteredIds);
    }
  };

  const allFilteredProductsSelected = filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductIds.includes(product.id));

  const deleteProductMutation = useMutation({
    mutationFn: async ({ ids, force }: { ids: string[]; force: boolean }) => {
      await Promise.all(ids.map((id) => deleteProduct(id, force)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDeleteSelected = async () => {
    if (selectedProductIds.length === 0) return;
    const ids = selectedProductIds.map((id) => id.trim()).filter(Boolean);

    // Check for mapped assets first
    try {
      const checks = await Promise.all(ids.map((id) => checkProductDeleteStatus(id)));
      const totalAssets = checks.reduce((sum, c) => sum + c.asset_count, 0);

      if (totalAssets > 0) {
        // Show confirmation dialog
        setPendingDeleteIds(ids);
        setDeleteCheckResults(checks);
        setDeleteConfirmOpen(true);
        return;
      }

      // No assets mapped, delete directly
      await performDelete(ids, false);
    } catch (err) {
      pushToast({
        title: "Failed to check product status",
        description: handleApiError(err),
        variant: "error",
      });
    }
  };

  const performDelete = async (ids: string[], force: boolean) => {
    deleteProductMutation
      .mutateAsync({ ids, force })
      .then(() => {
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        pushToast({
          title: ids.length === 1 ? "Product deleted" : "Products deleted",
          variant: "success",
        });
        setSelectedProductIds([]);
        setEditingProductId(null);
        setDeleteConfirmOpen(false);
        setPendingDeleteIds([]);
        setDeleteCheckResults([]);
      })
      .catch((err) => {
        pushToast({
          title: "Failed to delete product",
          description: handleApiError(err),
          variant: "error",
        });
        qc.invalidateQueries({ queryKey: ["products"] });
      });
  };

  const handleConfirmDelete = () => {
    performDelete(pendingDeleteIds, true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPendingDeleteIds([]);
    setDeleteCheckResults([]);
  };

  const handleStartEdit = () => {
    if (!canEdit) return;
    const targetId = selectedProductIds[0];
    const target = products.find((p) => p.id === targetId);
    if (!target) return;
    setEditingProductId(targetId);
    setEditProduct({
      brandId: target.brandId,
      name: target.name,
      url: target.url,
    });
  };

  useEffect(() => {
    if (!canEdit) {
      setEditingProductId(null);
    }
  }, [canEdit]);

  const clearSelection = () => {
    setSelectedProductIds([]);
    setEditingProductId(null);
  };

  const filterContent = (
    <div className="space-y-3">
      <div className="flex flex-col space-y-1">
        <Label className="text-sm font-medium">Brand</Label>
        <Select
          value={draftBrandFilter || ""}
          onValueChange={(value) => setDraftBrandFilter(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    // Root: fixed, no global scroll; inner table scrolls
    <div className="h-full flex flex-col bg-white text-gray-700 overflow-hidden">
      {selectedProductIds.length > 0 ? (
        <ActionBar
          selectedCount={selectedProductIds.length}
          entityLabel="product"
          clearSelection={clearSelection}
          primaryLabel={allFilteredProductsSelected ? "Deselect All" : "Select All"}
          secondaryLabel="Edit"
          dangerLabel="Delete"
          onPrimaryClick={handleSelectAllToggle}
          onSecondaryClick={handleStartEdit}
          onDangerClick={handleDeleteSelected}
          secondaryDisabled={!canEdit}
        />
      ) : (
        <FilterBar
          leftControl={
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-md"
              onClick={handleBack}
            >
              <ArrowLeft size={12} />
            </Button>
          }
          search={search}
          onSearchChange={setSearch}
          onSearch={() => {}}
          filterContent={filterContent}
          filtersActive={filtersActive}
          onClear={handleClearFilters}
          onFiltersApply={() => {
            setSelectedBrandFilter(draftBrandFilter);
            setCurrentPage(1);
          }}
          onFiltersReset={() => {
            setDraftBrandFilter(null);
            setSelectedBrandFilter(null);
            setCurrentPage(1);
          }}
          onNewClick={() => setShowModal(true)}
          newLabel="New Product"
          searchPlaceholder="Search products..."
        />
      )}

      {/* Content area – fills remaining space, only inner table wrapper scrolls */}
      <div className="p-[20px] flex-1 flex flex-col overflow-hidden">
        <Card className="flex h-full flex-col overflow-hidden shadow-sm border">
          <CardHeader>
            <CardTitle>Product List</CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Padding wrapper (static) */}
            <div className="px-6 pb-4 pt-2 flex-1 flex flex-col overflow-hidden">
              {/* Scroll only here */}
              <div className="border rounded-md flex-1 overflow-y-auto overflow-x-hidden">
                <Table className="w-full table-fixed">
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="w-[60px] px-4" />
                      <TableHead className="w-[16%] px-4">Brand</TableHead>
                      <TableHead className="w-[26%] px-4">Product Name</TableHead>
                      <TableHead className="w-[30%] px-4">Shopify URL</TableHead>
                      <TableHead className="w-[14%] px-4">Img/Vid</TableHead>
                      <TableHead className="w-[14%] px-4">Total</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {currentItems.map((p, idx) => {
                      return (
                      <TableRow
                        key={`${p.id}-${idx}`}
                        className="align-middle hover:bg-gray-50 h-11"
                      >
                        {editingProductId === p.id ? (
                          <>
                            {/* Checkbox */}
                            <TableCell className="w-[60px] px-4 py-3 align-middle">
                              <Checkbox
                                checked={selectedProductIds.includes(p.id)}
                                onCheckedChange={() =>
                                  toggleSelectProduct(p.id)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === " " || e.key === "Enter") {
                                    e.preventDefault();
                                    toggleSelectProduct(p.id);
                                  }
                                }}
                                aria-label={`Select product ${p.name}`}
                              />
                            </TableCell>

                            {/* Brand */}
                            <TableCell className="w-[16%] px-4 py-3 text-sm text-foreground align-middle">
                              <Select
                                value={editProduct.brandId}
                                onValueChange={(value) =>
                                  setEditProduct((prev) => ({
                                    ...prev,
                                    brandId: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                  {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                      {brand.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            {/* Product Name */}
                            <TableCell className="w-[24%] px-4 py-3 text-sm text-foreground align-middle">
                              <Input
                                className="h-8 text-sm"
                                value={editProduct.name}
                                onChange={(e) =>
                                  setEditProduct((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                              />
                            </TableCell>

                            {/* Shopify URL + actions */}
                            <TableCell className="w-[12%] px-4 py-3 text-sm text-foreground align-middle">
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                {p.assetsBreakdown?.image ?? 0}/{p.assetsBreakdown?.video ?? 0}
                              </span>
                            </TableCell>

                            <TableCell className="w-[10%] px-4 py-3 text-sm text-foreground align-middle">
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                {p.assetsCount ?? 0}
                              </span>
                            </TableCell>

                            <TableCell className="w-[38%] px-4 py-3 text-sm text-foreground align-middle">
                              <div className="flex items-center justify-between gap-2">
                                <Input
                                  className="h-8 text-sm"
                                  value={editProduct.url}
                                  onChange={(e) =>
                                    setEditProduct((prev) => ({
                                      ...prev,
                                      url: e.target.value,
                                    }))
                                  }
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleSaveEdit(p.id)}
                                  >
                                    <Check className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="w-4 h-4 text-gray-600" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            {/* Checkbox */}
                            <TableCell className="w-[60px] px-4 py-3 align-middle">
                              <Checkbox
                                checked={selectedProductIds.includes(p.id)}
                                onCheckedChange={() =>
                                  toggleSelectProduct(p.id)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === " " || e.key === "Enter") {
                                    e.preventDefault();
                                    toggleSelectProduct(p.id);
                                  }
                                }}
                                aria-label={`Select product ${p.name}`}
                              />
                            </TableCell>

                            {/* Brand */}
                            <TableCell className="w-[16%] px-4 py-3 text-sm text-foreground align-middle">
                              {brandMap[p.brandId]}
                            </TableCell>

                            {/* Product Name */}
                            <TableCell className="w-[26%] px-4 py-3 text-sm text-foreground align-middle whitespace-nowrap overflow-hidden text-ellipsis">
                              {p.name}
                            </TableCell>

                            {/* URL */}
                            <TableCell className="w-[30%] px-4 py-3 text-sm text-foreground align-middle">
                              <a
                                href={p.url}
                                target="_blank"
                                className="text-blue-600 hover:underline block truncate"
                              >
                                {p.url}
                              </a>
                            </TableCell>

                            <TableCell className="w-[14%] px-4 py-3 text-sm text-foreground align-middle">
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                {p.assetsBreakdown?.image ?? 0}/{p.assetsBreakdown?.video ?? 0}
                              </span>
                            </TableCell>

                            <TableCell className="w-[14%] px-4 py-3 text-sm text-foreground align-middle">
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                {p.assetsCount ?? 0}
                              </span>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

          {/* Pagination */}
          <div className="flex justify-center py-4 px-4 bg-white border-t">
            <ScalablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <AddProductModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddProduct}
          brands={brands}
          defaultBrandId={selectedBrandFilter}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              {(() => {
                const totalAssets = deleteCheckResults.reduce((sum, c) => sum + c.asset_count, 0);
                const productCount = pendingDeleteIds.length;
                if (productCount === 1 && deleteCheckResults[0]) {
                  return `${totalAssets} asset${totalAssets !== 1 ? "s are" : " is"} mapped to "${deleteCheckResults[0].product_name}". Delete anyway?`;
                }
                return `${totalAssets} asset${totalAssets !== 1 ? "s are" : " is"} mapped to ${productCount} products. Delete anyway?`;
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
