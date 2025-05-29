import React from "react";

import { Dialog, DialogContent } from "../ui/dialog";

const Loading = ({ open }: { open: boolean }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-transparent border-none flex items-center justify-center shadow-none [&>button:last-child]:hidden">
        <i className="loading-icon size-[45px] animate-spin" />
      </DialogContent>
    </Dialog>
  );
};

export default Loading;
