import { signIn } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

const signInProviders = [{ slug: "discord", name: "Discord" }];
const SignIn = () => {
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <div
        className={
          "h-screen min-h-full text-gray-900 dark:bg-slate-800 dark:text-gray-200"
        }
      >
        <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight ">
                Sign in to your account
              </h2>
            </div>

            {signInProviders.map((provider) => (
              <div key={provider.slug}>
                <SignInButton provider={provider} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};

const SignInButton = ({
  provider,
}: {
  provider: { slug: string; name: string };
}) => {
  return (
    <button
      onClick={() => void signIn(provider.slug)}
      className="flex w-full justify-center rounded-3xl border border-gray-200 p-1 py-2 font-semibold text-black hover:bg-gray-50 dark:bg-white dark:text-slate-700 dark:hover:bg-gray-300 sm:p-2"
    >
      <Image
        height={20}
        width={20}
        src={"/" + provider.slug + ".svg"}
        className="mr-2 h-6 w-6 object-fill"
        alt={provider.name}
      />
      {"Sign in with " + provider.name}
    </button>
  );
};
export default SignIn;
