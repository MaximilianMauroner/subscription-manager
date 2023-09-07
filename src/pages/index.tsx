import { RepeatFrequency } from "@prisma/client";
import {
  Button,
  Label,
  Modal,
  Select,
  TextInput,
  Textarea,
  Table,
  Dropdown,
} from "flowbite-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { HiCash, HiPlus, HiRefresh, HiUser } from "react-icons/hi";

import { RouterOutputs, api } from "~/utils/api";

type MemberSubscriptionType = {
  id: string;
  name: string;
  share: number;
};

export default function Home() {
  const [openModal, setOpenModal] = useState(false);
  useSession({ required: true });
  return (
    <>
      <Head>
        <title>Subscrption Manager</title>
        <meta name="description" content="Subscrption Manager" />
      </Head>

      <main className="h-full min-h-screen w-full">
        <AddSubscrptionModal
          isOpenModal={openModal}
          toggleModal={() => setOpenModal((old) => !old)}
        />
        <ListSubscriptions
          isOpenModal={openModal}
          toggleModal={() => setOpenModal((old) => !old)}
        />
      </main>
    </>
  );
}

const AddSubscrptionModal = ({
  isOpenModal,
  toggleModal,
}: {
  isOpenModal: boolean;
  toggleModal: () => void;
}) => {
  const [members, setMembers] = useState<MemberSubscriptionType[]>([]);
  const [price, setPrice] = useState<number | string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [repeatFlag, setRepeatFlag] = useState<RepeatFrequency>("MONTHLY");
  const [intervalTime, setIntervalTime] = useState<number>(1);
  const [repeatFirstDate, setRepeatFirstDate] = useState<Date>(new Date());
  const [lastPaymentDate, setLastPaymentDate] = useState<Date>(new Date());
  const context = api.useContext();
  const mutation = api.subscription.create.useMutation({
    onSuccess: async () => {
      await context.subscription.list.invalidate();
      toggleModal();
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({
      lastPaymentDate: lastPaymentDate,
      name: name,
      description: description,
      intervalPeriod: {
        interval: intervalTime,
        repeatFirstDate: repeatFirstDate,
        repeatFlag: repeatFlag,
      },
      price: +price,
    });
  };
  return (
    <Modal
      theme={{ root: { base: "h-full", sizes: { lg: "h-full" } } }}
      show={isOpenModal}
      onClose={toggleModal}
      size={"xl"}
    >
      <Modal.Header>Add a new Subscription</Modal.Header>
      <Modal.Body>
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Name" />
            </div>
            <TextInput
              id="name"
              icon={HiUser}
              placeholder="Netflix"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="description" value="Description" />
            </div>
            <Textarea
              id="description"
              placeholder="Subscription for Netflix with: Fizz, Buzz, John, Doe and Me"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="price" value="Price" />
            </div>
            <TextInput
              id="price"
              placeholder="17.99"
              required
              icon={HiCash}
              type="number"
              value={price}
              onChange={(e) => {
                e.target.value === ""
                  ? setPrice("")
                  : setPrice(Number(e.target.value));
              }}
            />
          </div>
          <div className="flex flex-row space-x-1">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="interval" value="Interval" />
              </div>
              <TextInput
                id="interval"
                placeholder="1"
                required
                icon={HiRefresh}
                type="number"
                value={intervalTime}
                onChange={(e) => {
                  setIntervalTime(Number(e.target.value));
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="repeatFlag" value="Repeating" />
              </div>
              <Select
                id="repeatFlag"
                required
                value={repeatFlag}
                onChange={(e) =>
                  setRepeatFlag(e.target.value as RepeatFrequency)
                }
              >
                {Object.values(RepeatFrequency).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="date" value="On the" />
            </div>
            <TextInput
              id="date"
              required
              type="date"
              value={moment(repeatFirstDate).format("YYYY-MM-DD")}
              onChange={(e) => {
                setRepeatFirstDate(new Date(e.target.value));
              }}
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="lastPaymentDate" value="Last Payment Date" />
            </div>
            <TextInput
              id="lastPaymentDate"
              required
              type="date"
              value={moment(lastPaymentDate).format("YYYY-MM-DD")}
              onChange={(e) => {
                setLastPaymentDate(new Date(e.target.value));
              }}
            />
          </div>
          <AddSubscriptionMembers setMembers={setMembers} />
          <Table className="m-4">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {members.map((member) => (
                <Table.Row
                  key={member.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  {member.name}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button type="submit">Submit</Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

const AddSubscriptionMembers = ({
  setMembers,
}: {
  setMembers: (member: MemberSubscriptionType[]) => void;
}) => {
  const { data: members, isLoading, isError } = api.member.list.useQuery();
  if (!members || isLoading || isError) {
    return <p>Loading...</p>;
  }

  return (
    <Select>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </Select>
  );
};

const ListSubscriptions = ({
  isOpenModal,
  toggleModal,
}: {
  isOpenModal: boolean;
  toggleModal: () => void;
}) => {
  const { data, isLoading, isError } = api.subscription.list.useQuery();

  if (!data || isLoading || isError) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <Table className="m-4">
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Members</Table.HeadCell>
          <Table.HeadCell>Last Payment Date</Table.HeadCell>
          <Table.HeadCell>Next Payment Date</Table.HeadCell>
          <Table.HeadCell>Price</Table.HeadCell>
          <Table.HeadCell>
            <Button size="sm" onClick={toggleModal}>
              <HiPlus />
            </Button>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((subscription) => (
            <Table.Row
              key={subscription.id}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <SubscriptionRow subscription={subscription} />
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
};

const SubscriptionRow = ({
  subscription,
}: {
  subscription: RouterOutputs["subscription"]["list"]["0"];
}) => {
  return (
    <>
      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
        {subscription.name}
      </Table.Cell>
      <Table.Cell>
        {subscription.subscriptionMembers.length > 0
          ? subscription.subscriptionMembers.map((e) => e.member.name).join(",")
          : "No members"}
      </Table.Cell>
      <Table.Cell>
        {subscription.lastPaymentDate?.toLocaleDateString() ?? "No Last Date"}
      </Table.Cell>
      <Table.Cell>
        {subscription.nextPaymentDate?.toLocaleDateString() ?? "No Next Date"}
      </Table.Cell>
      <Table.Cell>{subscription.price}</Table.Cell>
      <Table.Cell>
        <a
          className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
          // href="/tables"
        >
          <p>Edit</p>
        </a>
      </Table.Cell>
    </>
  );
};
