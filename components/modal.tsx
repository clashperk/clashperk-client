"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as React from "react";

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string; // Content class name
  /** Wraps the body and footer in a form, so a `type="submit"` footer button submits it. */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

function FormWrap({
  onSubmit,
  children,
}: Pick<ModalProps, "onSubmit" | "children">) {
  if (!onSubmit) return <>{children}</>;
  return (
    <form onSubmit={onSubmit} className="contents">
      {children}
    </form>
  );
}

export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
  onSubmit,
}: ModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={className}>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <FormWrap onSubmit={onSubmit}>
            {children}
            {footer && <div className="flex justify-end gap-2">{footer}</div>}
          </FormWrap>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="text-left">
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <FormWrap onSubmit={onSubmit}>
          <div className={className ? `px-4 ${className}` : "px-4"}>
            {children}
          </div>
          <DrawerFooter className="pt-2">
            {footer}
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </FormWrap>
      </DrawerContent>
    </Drawer>
  );
}
