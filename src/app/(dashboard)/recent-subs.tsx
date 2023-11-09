import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { api } from "~/trpc/server";
import { RouterOutputs } from "~/trpc/shared";

type SubList = RouterOutputs["sub"]["list"];

export function RecentSubs({ subs }: { subs: SubList }) {
  return (
    <div className="space-y-8">
      {subs.map((sub) => (
        <RecentSubItem key={sub.id} sub={sub} />
      ))}
    </div>
  );
}

const RecentSubItem = ({ sub }: { sub: SubList[0] }) => {
  return (
    <>
      <Link href={`/subs/${sub.id}`}>
        <div className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              <b>Subscription:</b> {sub.name}
            </p>
            <p className="text-muted-foreground text-sm">
              <b>Members:</b>{" "}
              {sub.subMembers.map((e) => e.member.name).join(", ")}
            </p>
            <p className="text-muted-foreground text-sm">
              <b>Next Payment:</b> {sub.nextPaymentDate?.toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto font-medium">{sub.price}€</div>
        </div>
      </Link>
    </>
  );
};
