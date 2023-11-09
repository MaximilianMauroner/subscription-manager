import { SubForm } from "./(components)/suib-form";

export default function SettingsProfilePage() {
  return (
    <div className="flex  flex-col items-center space-y-6 pt-4">
      <div className="w-full md:w-1/3 lg:w-1/3">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create Subscription</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Create a new subscription for your account.
          </p>
        </div>
        <SubForm />
      </div>
    </div>
  );
}
