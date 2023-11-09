"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@radix-ui/react-select";
import { interval } from "~/types/sub-type";
import { RepeatFrequency } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

const repeatFrequencies = [
  { label: "Daily", value: RepeatFrequency.DAILY },
  { label: "Weekly", value: RepeatFrequency.WEEKLY },
  { label: "Monthly", value: RepeatFrequency.MONTHLY },
  { label: "Yearly", value: RepeatFrequency.YEARLY },
] as const;

const memberFormSchema = z.object({
  name: z.string().min(2, {
    message: "The Name must be at least 2 characters.",
  }),
  share: z.number(),
  isNew: z.boolean().optional().default(true),
});

const subFormSchema = z
  .object({
    subname: z.string().min(2, {
      message: "The Name must be at least 2 characters.",
    }),
    price: z.number(),
    members: z.array(memberFormSchema),
  })
  .merge(interval);

type AccountFormValues = z.infer<typeof subFormSchema>;
type MemberFormValues = z.infer<typeof memberFormSchema>;

// This can come from your database or API.
const defaultMemberValues: Partial<MemberFormValues> = {
  name: "John Doe",
  share: 50,
};
const defaultValues: Partial<AccountFormValues> = {
  subname: "Netflix",
  price: 18,
  interval: 2,
  repeatFlag: RepeatFrequency.MONTHLY,
  repeatFirstDate: new Date(),
};

export function SubForm() {
  const [members, setMembers] = useState<MemberFormValues[]>([]);
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(subFormSchema),
    defaultValues,
  });
  const router = useRouter();

  const mutation = api.sub.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Created Subscription",
      });
      void router.push("/");
    },
  });

  function onSubmit(data: AccountFormValues) {
    mutation.mutate({
      intervalPeriod: {
        interval: data.interval,
        repeatFlag: data.repeatFlag,
        repeatFirstDate: data.repeatFirstDate,
        monthDay: data.monthDay,
      },
      lastPaymentDate: data.repeatFirstDate,
      name: data.subname,
      price: data.price,
      members: members,
    });
    toast({ title: "Creating Subscription" });
  }
  function onMemberSubmit(data: MemberFormValues) {
    const memArr = form.getValues().members ?? [];
    memArr.push(data);
    form.setValue("members", memArr);
    setMembers(memArr);
  }

  return (
    <div className="relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="subname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Name</FormLabel>
                <FormControl>
                  <Input placeholder="Subscription Name..." {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed in the dashboard
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Subscription Price..."
                    {...field}
                    onChange={(event) => field.onChange(+event.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  This is the price that will be used to calculate payment
                  shares.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeatFirstDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPp")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The last payment date of your subscription.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="block gap-2 sm:flex ">
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Interval</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      max={100}
                      min={0}
                      placeholder="Interval..."
                      {...field}
                      onChange={(event) => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeatFlag"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col pt-2">
                  <FormLabel>Repeat frequency</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? repeatFrequencies.find(
                                (freq) => freq.value === field.value,
                              )?.label
                            : "Select a repeat frequency"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandGroup>
                          {repeatFrequencies.map((freq) => (
                            <CommandItem
                              value={freq.label}
                              key={freq.value}
                              onSelect={() => {
                                form.setValue("repeatFlag", freq.value);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  freq.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {freq.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className="absolute -bottom-20 w-full rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
            type="submit"
          >
            Create Subscription
          </Button>
        </form>
      </Form>
      <div className="space-y-2 text-center">
        <h3 className="pt-4 text-xl font-bold">Members</h3>
      </div>
      <Separator />
      <div className="flex justify-center">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-right">Share (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.length > 0 ? (
              members?.map((member, index) => (
                <TableRow key={index}>
                  <TableCell className="text-left font-semibold">
                    {member.name}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {member.share}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No members added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Separator className="my-8" />
      <AddMember onSubmit={onMemberSubmit} />
    </div>
  );
}

const AddMember = ({
  onSubmit,
}: {
  onSubmit: (data: MemberFormValues) => void;
}) => {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: defaultMemberValues,
  });

  const { data } = api.member.list.useQuery();

  console.log(data);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="share"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Share (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      max={100}
                      min={0}
                      placeholder="Share..."
                      {...field}
                      onChange={(event) => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="w-full" type="submit">
            Add Member
          </Button>
        </form>
      </Form>
    </>
  );
};
