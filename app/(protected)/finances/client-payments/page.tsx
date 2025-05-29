import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarForm } from "@/components/common/CalendarForm";
import ClientPaymentInfo from "@/components/finance/ClientPaymentInfo";
import CustomPagination from "@/components/common/CustomPagination";

export default function ClientPaymentsPage() {
  return (
    <div className="">
      <Breadcrumb className="mb-3">
        <BreadcrumbList className="text-[12px]">
          <BreadcrumbLink
            href="/finances"
            className="text-[#888888] text-center"
          >
            Finance Management
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage className="text-[#4F4F4F] text-center">
            Client Payments
          </BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <Card className="py-3">
          <CardContent className="flex-col pl-0 pr-0">
            <div className="">
              <div className="flex  py-0 gap-4 mb-4 px-3">
                <div className="relative flex-1 ">
                  <i className="search-icon absolute left-3 top-3 h-[12.8px] w-[12.8px] text-[#9E9E9E]" />
                  <Input
                    className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px]"
                    placeholder="Search by Full name/ NIC"
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-[36.8px] w-[36.8px]"
                    >
                      <i className="calender-icon  h-[18px] w-[18px] " />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-left text-[14px]">
                        Pick Date Range
                      </DialogTitle>
                    </DialogHeader>
                    <CalendarForm />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex gap-2 mb-3 px-3">
                <Select>
                  <SelectTrigger className="text-[11px] text-[#454545] flex-1 px-2">
                    <SelectValue placeholder="Individual / Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        className="text-[11px] text-[#454545]"
                        value="Individual"
                      >
                        Individual
                      </SelectItem>
                      <SelectItem
                        className="text-[11px] text-[#454545]"
                        value="Group"
                      >
                        Group
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="flex-1 text-[11px] text-[#454545] px-2">
                    <SelectValue placeholder="Paid / Non Paid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        className="text-[11px] text-[#454545]"
                        value="Paid"
                      >
                        Paid
                      </SelectItem>
                      <SelectItem
                        className="text-[11px] text-[#454545]"
                        value="Non Paid"
                      >
                        Non Paid
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <ClientPaymentInfo />
            </div>
            <div></div>
          </CardContent>
        </Card>

        <div className="text-center my-5">
          <div className="text-[11px] text-[#3D3D3D] mb-1">
            Showing results 13/500
          </div>
          <div className="flex items-center justify-center">
            <CustomPagination
              totalCount={500}
              className="flex items-center justify-center gap-2 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
