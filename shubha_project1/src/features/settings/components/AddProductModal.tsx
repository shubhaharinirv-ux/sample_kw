"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { pushToast } from "@/shared/lib/toast";

// ✅ Define props interface
interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { brandId: string; name: string; url: string }) => void;
  brands: { id: string; name: string }[];
  defaultBrandId?: string | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  open,
  onClose,
  onSave,
  brands,
  defaultBrandId,
}) => {
  const [brandId, setBrandId] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (defaultBrandId) {
      setBrandId(defaultBrandId);
    } else if (brands.length > 0) {
      setBrandId(brands[0].id);
    }
  }, [defaultBrandId, brands]);

  const handleSubmit = () => {
    if (!brandId || !productName || !url) {
      pushToast({
        title: "Missing details",
        description: "Please fill in brand, product name, and URL.",
        variant: "error",
      });
      return;
    }
    onSave({ brandId, name: productName, url });
    pushToast({
      title: "Product added",
      description: `"${productName}" has been saved.`,
      variant: "success",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white rounded-xl shadow-md border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Brand */}
          <div className="space-y-2">
            <Label className="text-gray-700">Select Brand</Label>
            <Select value={brandId} onValueChange={(value: string) => setBrandId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a brand..." />
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

          {/* Product Name */}
          <div className="space-y-2">
            <Label className="text-gray-700">Product Name</Label>
            <Input
              name="productName"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          {/* Shopify URL */}
          <div className="space-y-2">
            <Label className="text-gray-700">Shopify URL</Label>
            <Input
              name="productUrl"
              placeholder="Enter product URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              Add Product
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
