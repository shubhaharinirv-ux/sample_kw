"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE, getJSON, postJSON, patchJSON } from "@/shared/lib/api";
import { pushToast } from "@/shared/lib/toast";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Plus, Check, X, ArrowLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import FilterBar from "@/shared/components/layout/FilterBar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import ActionBar from "@/shared/components/layout/ActionBar";
import { ScalablePagination } from "@/shared/components/ui/ScalablePagination";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { useKeyboardEscape } from "@/shared/hooks/useKeyboardNavigation";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type Brand = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
};

const ManageBrandsPage: React.FC = () => {
  const { params, setParams } = useUrlState();
  const { brandId } = useParams<{ brandId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryString = location.search;

  // Query params (Manage Brands):
  // search -> search, pagination -> page.
  const parsePage = (value?: string) => {
    const parsed = parseInt(value ?? "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };
  const [newBrand, setNewBrand] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  const [newBrandDialogOpen, setNewBrandDialogOpen] = useState(false);

  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editBrand, setEditBrand] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(() =>
    brandId ? [brandId] : []
  );

  // FilterBar state
  const [search, setSearch] = useState(() => params.search ?? "");

  // Pagination (same pattern as ManageProducts)
  const [currentPage, setCurrentPage] = useState(() => parsePage(params.page));
  const itemsPerPage = 15;

  const qc = useQueryClient();

  const {
    data: brandsData,
    isLoading,
    isError,
    error,
  } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const raw = await getJSON<Record<string, any>[]>("/brands", { suppressToast: true });
      // Defensive: ensure raw is an array
      if (!Array.isArray(raw)) return [];
      return raw.map((b) => ({
        ...b,
        id: b.id ?? b._id ?? "",
      })) as Brand[];
    },
    staleTime: 1000 * 60,
  });
  // Defensive: ensure brands is always an array even if API returns null
  const brands = Array.isArray(brandsData) ? brandsData : [];

  useEffect(() => {
    setEditingBrandId(null);
    setEditBrand({ name: "", description: "" });
  }, [brandId, brands]);

  const addBrand = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      postJSON<Brand>("/brands", {
        name: payload.name,
        description: payload.description,
        icon: "Building2",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setNewBrand({ name: "", description: "" });
      setNewBrandDialogOpen(false);
    },
  });

  const updateBrand = useMutation({
    mutationFn: (payload: { id: string; name: string; description: string }) =>
      patchJSON<Brand>(`/brands/${payload.id}`, {
        name: payload.name,
        description: payload.description,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setEditingBrandId(null);
      setEditBrand({ name: "", description: "" });
    },
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brand");
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const handleCreate = () => {
    const name = newBrand.name.trim();
    if (!name) return;
    const normalized = name.toLowerCase();
    const exists = brands.some(
      (b) => b.name.trim().toLowerCase() === normalized
    );
    if (exists) {
      pushToast({
        title: "Duplicate brand",
        description: "A brand with this name already exists.",
        variant: "error",
      });
      return;
    }
    addBrand.mutate({
      name,
      description: newBrand.description.trim(),
    });
  };

  const startEdit = (brand: Brand) => {
    setEditingBrandId(brand.id);
    setEditBrand({
      name: brand.name,
      description: brand.description ?? "",
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editBrand.name.trim()) return;
    updateBrand.mutate({
      id,
      name: editBrand.name.trim(),
      description: editBrand.description.trim(),
    });
  };

  const handleCancelEdit = () => {
    setEditingBrandId(null);
    setEditBrand({ name: "", description: "" });
  };

  const handleBack = () => window.history.back();

  // Search filtering
  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return brands;
    return brands.filter((b) => {
      const haystack = `${b.name} ${b.description ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [brands, search]);

  useEffect(() => {
    setSearch(params.search ?? "");
  }, [params.search]);

  useEffect(() => {
    setCurrentPage(parsePage(params.page));
  }, [params.page]);

  useEffect(() => {
    setParams({
      search: search || undefined,
      page: currentPage > 1 ? String(currentPage) : undefined,
    });
  }, [currentPage, search, setParams]);

  useEffect(() => {
    if (!brandId) return;
    setSelectedBrandIds((prev) =>
      prev.includes(brandId) ? prev : [brandId]
    );
  }, [brandId]);

  useEffect(() => {
    if (selectedBrandIds.length === 1) {
      const target = selectedBrandIds[0];
      if (brandId !== target) {
        navigate(`/settings/brands/${target}${queryString}`, {
          replace: true,
        });
      }
      return;
    }

    if (brandId) {
      navigate(`/settings/brands${queryString}`, { replace: true });
    }
  }, [brandId, navigate, queryString, selectedBrandIds]);

  const filtersActive = !!search.trim();

  const handleClearFilters = () => {
    setSearch("");
    setSelectedBrandIds([]);
    setEditingBrandId(null);
    setEditBrand({ name: "", description: "" });
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBrands.length / itemsPerPage)
  );

  const currentItems = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filteredBrands.length]);

  const toggleSelectBrand = (id: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]
    );
  };

  const canEdit = selectedBrandIds.length === 1;

  const handleSelectAllToggle = () => {
    // Toggle: If all filtered brands are selected, deselect all; otherwise select all
    const allFilteredIds = filteredBrands.map((brand) => brand.id);
    const allFilteredSelected = allFilteredIds.every((id) => selectedBrandIds.includes(id));

    if (allFilteredSelected) {
      // Deselect all filtered brands
      setSelectedBrandIds([]);
    } else {
      // Select all filtered brands (across all pages)
      setSelectedBrandIds(allFilteredIds);
    }
  };

  const allFilteredBrandsSelected = filteredBrands.length > 0 && filteredBrands.every((brand) => selectedBrandIds.includes(brand.id));

  const handleDeleteSelected = () => {
    if (selectedBrandIds.length === 0) return;
    selectedBrandIds.forEach((id) => deleteBrand.mutate(id));
    setSelectedBrandIds([]);
    setEditingBrandId(null);
    setEditBrand({ name: "", description: "" });
  };

  const handleStartEdit = () => {
    if (!canEdit) return;
    const targetId = selectedBrandIds[0];
    const target = filteredBrands.find((b) => b.id === targetId);
    if (!target) return;
    startEdit(target);
  };

  useEffect(() => {
    if (!canEdit) {
      setEditingBrandId(null);
      setEditBrand({ name: "", description: "" });
    }
  }, [canEdit]);

  const clearSelection = () => {
    setSelectedBrandIds([]);
    setEditingBrandId(null);
    setEditBrand({ name: "", description: "" });
  };

  const filterContent = (
    <div className="text-sm text-gray-600">
      <p>
        No advanced filters yet. Use the search bar to find brands by name or
        description.
      </p>
    </div>
  );

  return (
    // Root: fixed height, no global scroll
    <div className="h-full flex flex-col bg-white text-gray-700 overflow-hidden">
      {selectedBrandIds.length > 0 ? (
        <ActionBar
          selectedCount={selectedBrandIds.length}
          entityLabel="brand"
          clearSelection={clearSelection}
          primaryLabel={allFilteredBrandsSelected ? "Deselect All" : "Select All"}
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
          onNewClick={() => setNewBrandDialogOpen(true)}
          newLabel="New Brand"
          searchPlaceholder="Search brands..."
        />
      )}

      {/* Content area – matches ManageUsers style, only inner table scrolls */}
      <div className="p-[20px] flex-1 flex flex-col overflow-hidden">
        <Card className="flex h-full flex-col overflow-hidden shadow-sm border">
          <CardHeader>
            <CardTitle>Existing Brands</CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Wrapper with padding that fills card */}
            <div className="px-6 pb-4 pt-2 flex-1 flex flex-col overflow-hidden">
              {/* Scroll ONLY here */}
              <div className="border rounded-md flex-1 overflow-y-auto overflow-x-hidden">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="w-[60px] px-4"></TableHead>
                      <TableHead className="px-4">Brand Name</TableHead>
                      <TableHead className="px-4">Description</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-left px-4 py-6 text-sm text-gray-500"
                        >
                          Loading brands...
                        </TableCell>
                      </TableRow>
                    )}

                    {isError && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-left px-4 py-6 text-sm text-red-600"
                        >
                          {error instanceof Error
                            ? error.message
                            : "Failed to load brands"}
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading && !isError && filteredBrands.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-left px-4 py-6 text-sm text-gray-500"
                        >
                          No brands found.
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading &&
                      !isError &&
                      filteredBrands.length > 0 &&
                      currentItems.map((brand) => (
                        <TableRow
                          key={brand.id}
                          className="align-middle hover:bg-gray-50"
                        >
                          {editingBrandId === brand.id ? (
                            <>
                              {/* Checkbox */}
                              <TableCell className="w-[60px] px-4 py-3">
                                <Checkbox
                                  checked={selectedBrandIds.includes(brand.id)}
                                  onCheckedChange={() =>
                                    toggleSelectBrand(brand.id)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === " " || e.key === "Enter") {
                                      e.preventDefault();
                                      toggleSelectBrand(brand.id);
                                    }
                                  }}
                                  aria-label={`Select brand ${brand.name}`}
                                />
                              </TableCell>

                              {/* Brand Name (editable) */}
                              <TableCell className="px-4 py-3 text-sm">
                                <Input
                                  value={editBrand.name}
                                  onChange={(e) =>
                                    setEditBrand((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="h-8 text-sm"
                                />
                              </TableCell>

                              {/* Description (editable + actions) */}
                              <TableCell className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editBrand.description}
                                    onChange={(e) =>
                                      setEditBrand((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                      }))
                                    }
                                    className="h-8 text-sm"
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSaveEdit(brand.id)}
                                      disabled={updateBrand.isPending}
                                    >
                                      <Check className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleCancelEdit}
                                      disabled={updateBrand.isPending}
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
                              <TableCell className="w-[60px] px-4 py-3">
                                <Checkbox
                                  checked={selectedBrandIds.includes(brand.id)}
                                  onCheckedChange={() =>
                                    toggleSelectBrand(brand.id)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === " " || e.key === "Enter") {
                                      e.preventDefault();
                                      toggleSelectBrand(brand.id);
                                    }
                                  }}
                                  aria-label={`Select brand ${brand.name}`}
                                />
                              </TableCell>

                              {/* Brand Name */}
                              <TableCell className="px-4 py-3 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {brand.name}
                              </TableCell>

                              {/* Description */}
                              <TableCell className="px-4 py-3 text-sm">
                                {brand.description || "N/A"}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

          {/* Pagination – same UI as ManageProducts */}
          <div className="flex justify-center py-4 px-4 bg-white border-t">
            <ScalablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </div>

      {/* New Brand Dialog */}
      <Dialog open={newBrandDialogOpen} onOpenChange={setNewBrandDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Create a new brand to organize your products and assets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={newBrand.name}
                onChange={(e) =>
                  setNewBrand((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Kalai"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-description">Description</Label>
              <Input
                id="brand-description"
                value={newBrand.description}
                onChange={(e) =>
                  setNewBrand((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Short description (optional)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewBrandDialogOpen(false);
                  setNewBrand({ name: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={addBrand.isPending}
              >
                <Plus className="w-4 h-4" />
                {addBrand.isPending ? "Adding..." : "Add Brand"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBrandsPage;
