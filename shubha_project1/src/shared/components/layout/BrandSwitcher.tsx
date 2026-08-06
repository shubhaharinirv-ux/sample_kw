"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Network,
  Factory,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useBoards } from "@/features/boards/context/BoardsContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBrands, createBrand } from "@/features/settings/api/brands.api";
import type { BrandViewModel, BrandFormValues } from "@/shared/types/domain";
import { handleApiError } from "@/shared/lib/api";
import { pushToast } from "@/shared/lib/toast";

type BrandFile = BrandViewModel;

const ICONS: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  Building2,
  Network,
  Factory,
};

export function BrandSwitcher() {
  const { selectedBrandId, setSelectedBrandId, setSelectedBoardId } =
    useBoards();
  const [currentBrand, setCurrentBrand] = useState<BrandFile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  const queryClient = useQueryClient();

  const { data: brands, isLoading, isError } = useQuery<BrandFile[]>({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  // -----------------------------
  // Load selected brand or fallback
  // -----------------------------
  useEffect(() => {
    // If we're still loading or have an error, don't change anything yet
    if (!brands) return;

    // If no brands exist at all, we should have no selectedBrandId
    if (brands.length === 0) {
      if (selectedBrandId !== null) {
        setSelectedBrandId(null);
      }
      setCurrentBrand(null);
      return;
    }

    const found = selectedBrandId
      ? brands.find((b) => b.id === selectedBrandId)
      : null;

    if (found) {
      setCurrentBrand(found);
      return;
    }

    // Fallback: select the first available brand if the current one is invalid or not set
    const fallback = brands[0];
    setCurrentBrand(fallback);
    if (fallback && fallback.id !== selectedBrandId) {
      setSelectedBrandId(fallback.id);
    }
  }, [brands, selectedBrandId, setSelectedBrandId]);

  // -----------------------------
  // Select brand
  // -----------------------------
  const emitBrandUserChange = (brandId: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("kalai:brand-user-change", { detail: { brandId } })
    );
  };

  const handleBrandSelect = (brand: BrandFile) => {
    emitBrandUserChange(brand.id);
    setCurrentBrand(brand);
    setSelectedBrandId(brand.id);
    setSelectedBoardId(null);
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;

    const newBrand: BrandFormValues = {
      name: newBrandName.trim(),
      icon: "Building2",
      description: "",
    };

    try {
      const createdBrand = await createBrand(newBrand);

      // invalidate query so it refetches updated brands
      queryClient.invalidateQueries({ queryKey: ["brands"] });

      setCurrentBrand(createdBrand);
      setSelectedBrandId(createdBrand.id);
      emitBrandUserChange(createdBrand.id);

      setNewBrandName("");
      setDialogOpen(false);
      pushToast({
        title: "Brand created",
        description: `"${createdBrand.name}" added.`,
      });
    } catch (err) {
      pushToast({
        title: "Brand creation failed",
        description: handleApiError(err),
        variant: "error",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const displayBrand = currentBrand || {
    id: "",
    name: isError ? "Error loading brands" : "No brands available",
    icon: "Building2",
    description: "",
  };

  const availableBrands = brands || [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-full rounded-xl bg-white text-gray-900 px-4 py-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {(() => {
                const iconKey = displayBrand.icon as keyof typeof ICONS;
                const Icon = ICONS[iconKey] || Building2;
                return <Icon className="h-5 w-5 text-gray-600" />;
              })()}
              <span className="text-sm font-medium">{displayBrand.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[260px] rounded-xl border border-gray-200 shadow-lg"
        >
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase">
            Brands
          </DropdownMenuLabel>

          {availableBrands.length === 0 ? (
            <DropdownMenuItem disabled className="text-sm text-gray-500">
              {isError ? "Failed to load brands" : "No brands available"}
            </DropdownMenuItem>
          ) : (
            availableBrands.map((brand) => {
              const iconKey = brand.icon as keyof typeof ICONS;
              const Icon = ICONS[iconKey] || Building2;
              return (
                <DropdownMenuItem
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="flex justify-between items-center cursor-pointer rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-gray-600" />}
                    <span className="text-sm text-gray-800">{brand.name}</span>
                  </div>
                  {currentBrand && brand.name === currentBrand.name && (
                    <Check className="h-4 w-4 text-gray-500" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setDialogOpen(true)}
            className="flex items-center gap-2 text-sm cursor-pointer rounded-lg"
          >
            <Plus className="h-4 w-4 text-gray-600" />
            <span>Add brand</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Brand Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a brand name to add a new brand to your account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 py-2">
            <Input
              placeholder="Brand name"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddBrand}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BrandSwitcher;
